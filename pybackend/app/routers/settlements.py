from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..models.expense import create_expense
from ..models.user import find_by_id
from .auth import get_current_user
from ..db.connection import expenses
from collections import defaultdict
from datetime import datetime

class SettlementCreate(BaseModel):
    groupId: str
    payerId: str
    receiverId: str
    amount: float

router = APIRouter(tags=['settlements'])

@router.post("/settlements")
async def create_settlement(body: SettlementCreate, user=Depends(get_current_user)):
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be > 0")
    
    payer = await find_by_id(body.payerId)
    if not payer:
        raise HTTPException(status_code=404, detail="Payer not found")

    receiver = await find_by_id(body.receiverId)
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    doc = {
        "groupId": body.groupId,
        "paidBy": body.payerId,
        "amount": body.amount,
        "description": f"Settlement from {payer['name']} to {receiver['name']}",
        "splits": [{"userId": body.receiverId, "amount": body.amount}],
        "date": datetime.utcnow()
    }
    
    eid = await create_expense(doc)
    return {"settlementId": str(eid)}

@router.get('/settlements/group/{group_id}')
async def compute_balances(group_id: str, user=Depends(get_current_user)):
    cursor = expenses.find({'groupId': group_id})
    balances = defaultdict(float)
    async for exp in cursor:
        paid_by = exp['paidBy']
        splits = exp.get('splits', [])
        if splits:
            for s in splits:
                uid = s['userId']
                amt = float(s['amount'])
                if uid == paid_by:
                    # if paid_by is also part of split, their own share reduces net owed amount
                    balances[paid_by] += (float(exp['amount']) - amt)
                else:
                    balances[paid_by] += amt
                    balances[uid] -= amt
    result = [{'userId': k, 'amount': v} for k, v in balances.items()]
    return result
