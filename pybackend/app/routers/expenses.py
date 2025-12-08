from fastapi import APIRouter, HTTPException, Depends
from ..schemas.expense_schema import ExpenseCreate
from ..models.expense import create_expense, list_by_group
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
        out.append(it)
    return out
