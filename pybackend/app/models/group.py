from ..db.connection import groups
from bson import ObjectId

async def create_group(doc: dict):
    res = await groups.insert_one(doc)
    return res.inserted_id

async def get_group(gid: str):
    return await groups.find_one({"_id": ObjectId(gid)})

async def add_member(gid: str, user_id: str):
    await groups.update_one({"_id": ObjectId(gid)}, {"$addToSet": {"members": user_id}})
