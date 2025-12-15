from typing import List, Optional
from bson import ObjectId
from app.db.connection import db  # <<-- important: import the shared db instance
from app.models.user import find_by_id

groups = db.get_collection("groups")


async def add_member(gid: str, user_id: str):
    await groups.update_one({"_id": ObjectId(gid)}, {"$addToSet": {"members": user_id}})

async def create_group(doc: dict) -> ObjectId:
    """
    Insert a group document into MongoDB
    doc example:
    {
        "name": "Friends",
        "members": ["shubhamsc@gmail.com"]
    }
    """
    result = await groups.insert_one(doc)
    return result.inserted_id


async def get_group(group_id: str) -> Optional[dict]:
    try:
        oid = ObjectId(group_id)
    except Exception:
        # if id is not a valid ObjectId, return None
        return None
    doc = await groups.find_one({"_id": oid})
    return doc


async def get_groups_for_member(member_id: str) -> List[dict]:
    """
    Return all groups where members contains member_id.
    If you store members as ObjectId in DB, try both forms.
    """
    # try as string first (if you store strings)
    cursor = groups.find({"members": member_id})
    res = []
    async for doc in cursor:
        res.append(doc)

    # if no results, and member_id can be ObjectId, try that
    if not res:
        try:
            oid = ObjectId(member_id)
            cursor = groups.find({"members": oid})
            async for doc in cursor:
                res.append(doc)
        except Exception:
            pass

    return res


async def get_group_members(gid: str):
    group = await get_group(gid)
    if not group:
        return []
    member_ids = group.get('members', [])
    members = []
    for mid in member_ids:
        user = await find_by_id(mid)
        if user:
            user['id'] = str(user['_id'])
            user.pop('_id', None)
            members.append(user)
    return members
