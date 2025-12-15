from typing import List
from asyncio.log import logger
from fastapi import APIRouter, HTTPException, Depends
from ..schemas.group_schema import GroupCreate
from ..models.group import create_group, get_group, groups
from ..models.user import find_by_email
from ..models.expense import list_by_group as list_expenses_by_group
from .auth import get_current_user
from collections import defaultdict

router = APIRouter(tags=['groups'])

@router.post("/groups")
async def create_group_route(body: GroupCreate, user=Depends(get_current_user)):
    """
    Create a new group.
    Expected payload:
    {
        "name": "Group Name",
        "members": ["email1@gmail.com", "email2@gmail.com"]
    }
    """

    if not body.name:
        raise HTTPException(status_code=400, detail="Group name is required")

    # Add current user to members list if not already there
    user_email = user.email
    if user_email not in body.members:
        body.members.append(user_email)

    group_doc = {
        "name": body.name,
        "members": body.members,
        "createdBy": user_email
    }

    group_id = await create_group(group_doc)

    # Fetch the created group to return it with populated members
    new_group = await get_group_route(str(group_id), user)

    return new_group

@router.get("/groups")
async def get_all_groups_route(user=Depends(get_current_user)):
    user_email = user.email
    group_list = []
    
    # Query for groups where the current user's email is in the 'members' array
    query = {"members": user_email}
    
    async for group in groups.find(query):
        group["id"] = str(group["_id"])
        del group["_id"]

        # Calculate total expenses for the group
        expenses = await list_expenses_by_group(group["id"])
        total_expenses = sum(exp.get("amount", 0) for exp in expenses)
        group["totalExpenses"] = total_expenses

        # Populate member details
        member_emails = group.get("members", [])
        member_details = []
        for email in member_emails:
            user_data = await find_by_email(email)
            if user_data:
                member_details.append({
                    "id": str(user_data.get("_id")),
                    "email": user_data.get("email"),
                    "name": user_data.get("name")
                })
        group["members"] = member_details
        
        group_list.append(group)

    return group_list



@router.get("/groups/{group_id}")
async def get_group_route(group_id: str, user=Depends(get_current_user)):
    grp = await get_group(group_id)
    if not grp:
        raise HTTPException(status_code=404, detail="Group not found")
    
    grp['id'] = str(grp['_id'])
    grp.pop('_id', None)

    member_emails = grp.get("members", [])
    member_details = []
    for email in member_emails:
        user_data = await find_by_email(email)
        if user_data:
            member_details.append({
                "id": str(user_data.get("_id")),
                "email": user_data.get("email"),
                "name": user_data.get("name")
            })

    grp["members"] = member_details
    
    # --- Balance and Debt Calculation ---
    expenses = await list_expenses_by_group(group_id)
    balances = defaultdict(float)

    for exp in expenses:
        paid_by = str(exp['paidBy'])
        splits = exp.get('splits', [])
        if splits:
            for s in splits:
                uid = str(s['userId'])
                amt = float(s['amount'])
                if uid == paid_by:
                    # if paid_by is also part of split, their own share reduces net owed amount
                    balances[paid_by] += (float(exp['amount']) - amt)
                else:
                    balances[paid_by] += amt
                    balances[uid] -= amt

    # Create list of balances in the required format
    grp['balances'] = [{"userId": uid, "amount": amt} for uid, amt in balances.items()]

    # Debt simplification
    creditors = {uid: amt for uid, amt in balances.items() if amt > 0}
    debtors = {uid: amt for uid, amt in balances.items() if amt < 0}
    
    debts = []
    
    creditor_uids = list(creditors.keys())
    debtor_uids = list(debtors.keys())

    i = 0
    j = 0
    while i < len(creditor_uids) and j < len(debtor_uids):
        creditor_id = creditor_uids[i]
        debtor_id = debtor_uids[j]
        
        credit = creditors[creditor_id]
        debt = debtors[debtor_id]

        amount_to_settle = min(credit, -debt)

        if amount_to_settle > 0.01: # Avoid floating point inaccuracies
            debts.append({
                "from": debtor_id,
                "to": creditor_id,
                "amount": amount_to_settle
            })

            creditors[creditor_id] -= amount_to_settle
            debtors[debtor_id] += amount_to_settle

        if abs(creditors[creditor_id]) < 0.01:
            i += 1
        if abs(debtors[debtor_id]) < 0.01:
            j += 1
            
    grp['debts'] = debts
    # --- End Calculation ---

    return grp
