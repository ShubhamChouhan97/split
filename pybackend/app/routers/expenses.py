from fastapi import APIRouter, HTTPException, Depends
from ..schemas.expense_schema import ExpenseCreate
from ..models.expense import create_expense, list_by_group
from ..models.user import find_by_id
from .auth import get_current_user
from datetime import datetime

router = APIRouter(tags=['expenses'])

@router.post("/expenses")
async def add_expense(body: ExpenseCreate, user=Depends(get_current_user)):
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be > 0")
    splits = body.splits
    if not splits:
        raise HTTPException(status_code=400, detail="Provide splits list")
    doc = {
        "groupId": body.groupId,
        "paidBy": body.paidBy,
        "amount": body.amount,
        "description": body.description,
        "splits": [s.dict() for s in splits],
        "date": datetime.utcnow()
    }
    eid = await create_expense(doc)
    return {"expenseId": str(eid)}

@router.get("/expenses/group/{group_id}")
async def list_expenses(group_id: str, user=Depends(get_current_user)):
    items = await list_by_group(group_id)
    out = []
    for it in items:
        it['id'] = str(it['_id'])
        it.pop('_id', None)
        # Populate paidByName
        payer = await find_by_id(it['paidBy'])
        it['paidByName'] = payer['name'] if payer else 'Unknown'
        # Populate userName in splits
        for split in it['splits']:
            split_user = await find_by_id(split['userId'])
            split['userName'] = split_user['name'] if split_user else 'Unknown'
        # Set createdAt
        it['createdAt'] = it['date'].isoformat() if 'date' in it and it['date'] else ''
        out.append(it)
    return out
