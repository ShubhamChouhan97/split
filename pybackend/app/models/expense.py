from ..db.connection import expenses
from bson import ObjectId

async def create_expense(doc: dict):
    res = await expenses.insert_one(doc)
    return res.inserted_id

async def list_by_group(gid: str):
    cursor = expenses.find({"groupId": gid}).sort("date", -1)
    return [doc async for doc in cursor]
