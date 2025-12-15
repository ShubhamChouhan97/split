from fastapi import APIRouter, Depends
from ..models.group import groups as groups_collection
from ..models.expense import expenses as expenses_collection
from .auth import get_current_user

router = APIRouter(tags=['activity'])

@router.get("/activity")
async def get_recent_activity(user=Depends(get_current_user)):
    user_email = user.email
    
    # Get all groups the user is a member of
    user_groups = await groups_collection.find({"members": user_email}).to_list(length=None)
    group_ids = [str(group['_id']) for group in user_groups]
    
    # Get all expenses for these groups
    expenses = await expenses_collection.find({"groupId": {"$in": group_ids}}).sort("date", -1).to_list(length=50)
    
    activities = []
    for expense in expenses:
        expense_id = str(expense['_id'])
        # Determine activity type
        description = expense.get('description', 'New expense')
        if "Settlement from" in description:
            activity_type = "settle"
        else:
            activity_type = "expense"
            
        activities.append({
            "id": expense_id,
            "type": activity_type,
            "description": description,
            "time": expense['date'].strftime("%Y-%m-%d %H:%M:%S")
        })
        
    return activities
