from typing import List
from asyncio.log import logger
from fastapi import APIRouter, HTTPException, Depends
from ..schemas.group_schema import GroupCreate
from ..models.group import create_group, get_group, groups
from ..models.user import add_group_to_user, users
from ..models.expense import expenses
from .auth import get_current_user


router = APIRouter(tags=['groups'])

@router.post("/groups")
async def create_group_route(body: GroupCreate):
    """
    Create a new group.
    Expected payload:
    {
        "name": "Group Name",
        "members": ["email1@gmail.com", "email2@gmail.com"]
    }
    """

    if not body.name:
        raise HTTPException(status_code=400, detail="Group name is required")

    group_doc = {
        "name": body.name,
        "members": body.members  # stored as list of strings (emails)
    }

    group_id = await create_group(group_doc)

    return {
        "message": "Group created successfully",
        "group_id": str(group_id), 
        "data": {
            "name": body.name,
            "members": body.members
        }
    }

@router.get("/groups")
async def get_all_groups_route():
    group_list = []

    async for group in groups.find():
        group["id"] = str(group["_id"])   # convert ObjectId → string
        del group["_id"]
        group_list.append(group)

    return group_list



@router.get("/groups/{group_id}")
async def get_group_route(group_id: str, user=Depends(get_current_user)):
    grp = await get_group(group_id)
    if not grp:
        raise HTTPException(status_code=404, detail="Group not found")
    
    grp['id'] = str(grp['_id'])
    grp.pop('_id', None)
    return grp
