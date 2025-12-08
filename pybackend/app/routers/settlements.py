from fastapi import APIRouter, Depends
from .auth import get_current_user
from ..db.connection import expenses
from collections import defaultdict

router = APIRouter(tags=['settlements'])

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
                    balances[paid_by] += (float(exp['amount']) - amt) - 0
                else:
                    balances[paid_by] += amt
                    balances[uid] -= amt
    result = [{'userId': k, 'balance': v} for k, v in balances.items()]
    return result
