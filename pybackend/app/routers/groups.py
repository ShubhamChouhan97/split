from fastapi import APIRouter, HTTPException, Depends
from ..schemas.group_schema import GroupCreate
from ..models.group import create_group, get_group
from ..models.user import add_group_to_user
from .auth import get_current_user

router = APIRouter(tags=['groups'])

@router.post("/groups")
async def create_group_route(body: GroupCreate, user=Depends(get_current_user)):
    doc = {"name": body.name, "members": body.members or [user['id']]}
    gid = await create_group(doc)
    for m in doc["members"]:
        try:
            await add_group_to_user(m, str(gid))
        except Exception:
            pass
    return {"groupId": str(gid)}

@router.get("/groups/{group_id}")
async def get_group_route(group_id: str, user=Depends(get_current_user)):
    grp = await get_group(group_id)
    if not grp:
        raise HTTPException(status_code=404, detail="Group not found")
    grp['id'] = str(grp['_id'])
    grp.pop('_id', None)
    return grp
