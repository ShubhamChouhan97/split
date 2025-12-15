# from ..db.connection import users
# from bson import ObjectId

# app/models/user.py
from typing import Optional
from bson import ObjectId
from app.db.connection import users
import logging

logger = logging.getLogger(__name__)

async def find_user_by_identifier(identifier: str) -> Optional[dict]:
    """
    Accepts an email (contains @) or a user-id hex string (ObjectId hex).
    Returns the user document or None.
    """
    if not identifier:
        return None

    # pref: if looks like email -> search by email
    if "@" in identifier:
        user = await users.find_one({"email": identifier})
        if user:
            return user

    # try as ObjectId
    try:
        oid = ObjectId(identifier)
        user = await users.find_one({"_id": oid})
        if user:
            return user
    except Exception:
        pass

    # fallback: username
    user = await users.find_one({"username": identifier})
    return user


async def add_group_to_user_by_id(user_oid: ObjectId, group_id_to_store):
    """
    Add group reference to user document `groups` array.
    `group_id_to_store` should be ObjectId if you store ObjectIds in users.groups,
    otherwise a string. This function does not convert group_id_to_store.
    """
    try:
        res = await users.update_one(
            {"_id": user_oid},
            {"$addToSet": {"groups": group_id_to_store}}
        )
        return bool(res.matched_count)
    except Exception:
        logger.exception("Failed to add group to user %s", user_oid)
        return False

async def create_user(doc: dict):
    res = await users.insert_one(doc)
    return res.inserted_id

async def find_by_email(email: str):
    return await users.find_one({"email": email})

async def find_by_id(uid: str):
    return await users.find_one({"_id": ObjectId(uid)})

async def add_group_to_user(uid: str, group_id: str):
    await users.update_one({"_id": ObjectId(uid)}, {"$addToSet": {"groups": group_id}})
