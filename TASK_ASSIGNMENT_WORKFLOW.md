# Task Assignment Workflow - Admin to Employee

## Overview
This document explains how tasks assigned by the admin appear in the employee dashboard.

## Complete Workflow

### 1. Admin Creates a Project
- Navigate to **Admin Dashboard** → **Create Project**
- Fill in project details:
  - Title
  - Description
  - Required skills
  - Experience required
  - Team size
  - Deadline
- Click **"Create Project"**

### 2. Admin Decomposes Project into Tasks
- After creating the project, navigate to **Neural Mapping** page
- Click **"Decompose"** button
- The AI (PlannerAgent) will break down the project into specific tasks
- Each task includes:
  - Title
  - Description
  - Estimated hours
  - Required skills
  - Priority level
  - Deadline

### 3. Admin Distributes Tasks to Team Members
- Click **"Distribute"** button on the Neural Mapping page
- The AI (MatcherAgent) will:
  - Analyze each employee's skills
  - Match employees to tasks based on skill compatibility
  - Assign each task to the best-suited employee
  - Calculate match scores and provide reasoning

### 4. Admin Finalizes the Project
- Review the task assignments
- Click **"Finalize & Deploy"** button
- This action:
  - Sets project status to "finalized"
  - Saves all tasks with `assigned_to` field pointing to employee IDs
  - Adds employees to the project's `assigned_team` array
  - Makes the project visible to employees

### 5. Employee Views Tasks in Dashboard
- Employee logs in and navigates to their dashboard
- The system automatically:
  - Fetches all projects where the employee is in `assigned_team`
  - Filters tasks where `assigned_to` matches the employee's profile ID
  - Displays tasks organized by status (Backlog, In Progress, Completed)

## Technical Details

### Backend API Endpoints

#### `/projects/my-projects` (GET)
- **Purpose**: Fetch all projects assigned to the logged-in employee
- **Authentication**: Required (Bearer token)
- **Returns**: Array of projects with all tasks
- **Logic**:
  ```python
  # Find employee profile
  profile = await EmployeeProfile.find_one(EmployeeProfile.user_id == current_user.id)
  
  # Find projects where employee is in assigned_team
  projects = await Project.find({"assigned_team": profile.id}).to_list()
  ```

#### `/projects/{project_id}` (PUT)
- **Purpose**: Update project (used during finalization)
- **Body**:
  ```json
  {
    "status": "finalized",
    "assigned_team": ["employee_id_1", "employee_id_2"],
    "tasks": [
      {
        "title": "Task Title",
        "description": "Task Description",
        "estimated_hours": 8,
        "required_skills": ["Python", "FastAPI"],
        "priority": "high",
        "deadline": "2026-02-10",
        "assigned_to": "employee_id_1",
        "status": "backlog"
      }
    ]
  }
  ```

### Frontend Components

#### TaskDashboard.jsx
- **Location**: `frontend/src/components/employee/TaskDashboard.jsx`
- **Functionality**:
  1. Fetches employee profile
  2. Fetches projects via `/projects/my-projects`
  3. Filters tasks where `assigned_to` matches employee ID
  4. Displays tasks in Kanban board format

#### NeuralMappingPage.jsx
- **Location**: `frontend/src/pages/NeuralMappingPage.jsx`
- **Functionality**:
  1. Decomposes project into tasks
  2. Matches employees to tasks
  3. Finalizes project with task assignments

### Data Models

#### ProjectTask
```python
class ProjectTask(BaseModel):
    title: str
    description: str
    estimated_hours: float
    required_skills: List[str]
    priority: str
    deadline: Optional[str] = "TBD"
    assigned_to: Optional[PydanticObjectId] = None  # Employee Profile ID
    status: str = "backlog"  # backlog, in_progress, completed
```

#### Project
```python
class Project(Document):
    title: str
    description: str
    required_skills: List[RequiredSkill]
    experience_required: float
    team_size: int = 5
    status: ProjectStatus = ProjectStatus.DRAFT
    tasks: List[ProjectTask] = []
    assigned_team: List[PydanticObjectId] = []  # Employee Profile IDs
    deadline: Optional[str] = None
```

## Debugging

### Check Console Logs
When an employee opens their dashboard, check the browser console for:
```
🔍 EMPLOYEE DASHBOARD DEBUG:
  Employee Profile ID: <profile_id>
  Employee Name: <name>
  Projects Found: <count>
  
  📁 Project 1: "<project_title>"
    Project ID: <id>
    Status: finalized
    Tasks in Project: <count>
    
      Task 1: "<task_title>"
        Assigned To: <employee_id>
        Status: backlog
        Match: ✅ YES / ❌ NO
        
  ✨ TOTAL TASKS ASSIGNED TO THIS EMPLOYEE: <count>
```

### Common Issues

#### Issue: Employee sees "Demo Mode" banner
**Cause**: No tasks have been assigned to this employee yet
**Solution**: 
1. Verify the admin has finalized a project
2. Check that the employee is in the project's assigned_team
3. Verify tasks have `assigned_to` field set to the employee's profile ID

#### Issue: Tasks not appearing even after assignment
**Possible Causes**:
1. **ID Mismatch**: Check console logs to compare `assigned_to` vs employee profile ID
2. **Project Status**: Ensure project status is "finalized"
3. **Serialization**: Check if IDs are stored as ObjectId vs string

**Debug Steps**:
1. Open browser console
2. Look for the debug logs
3. Compare the employee profile ID with task `assigned_to` values
4. Check if the match shows ✅ YES or ❌ NO

#### Issue: Backend returns empty projects array
**Possible Causes**:
1. Employee not in any project's `assigned_team`
2. Profile ID mismatch

**Debug Steps**:
1. Check backend logs for: `SYNC: User <email> (Profile: <id>) matched <count> projects`
2. Verify the employee's profile ID exists
3. Check MongoDB to see if the employee ID is in project's `assigned_team` array

## Testing the Flow

### Step-by-Step Test

1. **Create Test Employee**
   - Email: `test.employee@example.com`
   - Password: `Test123!`
   - Skills: Python, FastAPI, React

2. **Create Test Project (as Admin)**
   - Title: "Test Project"
   - Description: "Testing task assignment"
   - Required Skills: Python (Advanced), React (Intermediate)
   - Team Size: 1

3. **Navigate to Neural Mapping**
   - Click "Decompose" → Wait for tasks to generate
   - Click "Distribute" → Verify test employee appears with tasks
   - Click "Finalize & Deploy"

4. **Login as Test Employee**
   - Navigate to dashboard
   - Check browser console for debug logs
   - Verify tasks appear (no "Demo Mode" banner)
   - Verify task details match what was assigned

## Mock Data Fallback

If no real tasks are found, the system displays demo tasks for UI demonstration purposes. This is indicated by:
- Yellow banner at the top saying "Demo Mode - No Tasks Assigned Yet"
- Console log: `⚠️ No tasks found - using mock data for demo`

The mock data includes 5 sample tasks across different statuses to showcase the UI design.

## Summary

The task assignment flow is **fully implemented and working**. Tasks assigned by the admin will automatically appear in the employee dashboard once the project is finalized. The new debug logging and visual indicators help identify any issues in the assignment process.
