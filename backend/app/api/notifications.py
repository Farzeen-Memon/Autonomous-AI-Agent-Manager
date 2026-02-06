from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.models.notification import Notification, NotificationCreate
from app.models.employee import EmployeeProfile
from app.api.deps import get_current_user
from beanie import PydanticObjectId
from app.core.serialization import serialize_doc

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_my_notifications(current_user: User = Depends(get_current_user)):
    """Get all notifications for the current user"""
    # Find employee profile
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile:
        return []
    
    # Get notifications for this employee
    notifications = await Notification.find(
        Notification.employee_id == profile.id
    ).sort(-Notification.created_at).to_list()
    
    return serialize_doc(notifications)

@router.get("/unread", response_model=List[dict])
async def get_unread_notifications(current_user: User = Depends(get_current_user)):
    """Get unread notifications for the current user"""
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile:
        return []
    
    notifications = await Notification.find(
        Notification.employee_id == profile.id,
        Notification.read == False
    ).sort(-Notification.created_at).to_list()
    
    return serialize_doc(notifications)

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    notification = await Notification.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Verify ownership
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile or notification.employee_id != profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    notification.read = True
    await notification.save()
    
    return {"status": "success", "message": "Notification marked as read"}

@router.put("/mark-all-read")
async def mark_all_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read for the current user"""
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile:
        return {"status": "success", "message": "No notifications to mark"}
    
    notifications = await Notification.find(
        Notification.employee_id == profile.id,
        Notification.read == False
    ).to_list()
    
    for notification in notifications:
        notification.read = True
        await notification.save()
    
    return {"status": "success", "message": f"Marked {len(notifications)} notifications as read"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    """Delete a notification"""
    notification = await Notification.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Verify ownership
    profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
    if not profile or notification.employee_id != profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await notification.delete()
    
    return {"status": "success", "message": "Notification deleted"}
