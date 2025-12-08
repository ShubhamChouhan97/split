from pydantic import BaseModel, Field
from typing import List

class SplitItem(BaseModel):
    userId: str
    amount: float

class ExpenseCreate(BaseModel):
    groupId: str
    paidBy: str
    amount: float = Field(..., gt=0)
    description: str = ""
    splits: List[SplitItem] = []
