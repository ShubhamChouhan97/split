from ..db.connection import users
from bson import ObjectId

async def create_user(doc: dict):
    res = await users.insert_one(doc)
    return res.inserted_id

async def find_by_email(email: str):
    return await users.find_one({"email": email})

async def find_by_id(uid: str):
    return await users.find_one({"_id": ObjectId(uid)})

async def add_group_to_user(uid: str, group_id: str):
    await users.update_one({"_id": ObjectId(uid)}, {"$addToSet": {"groups": group_id}})
