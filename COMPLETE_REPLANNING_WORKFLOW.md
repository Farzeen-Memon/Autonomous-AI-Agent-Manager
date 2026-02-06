# Complete Replanning Workflow - Implementation Guide

## 🎯 Overview

This document describes the complete end-to-end workflow for the Nexo Replanning Agent, from health monitoring to deployment and employee notifications.

---

## 🔄 Complete Workflow

```
1. HEALTH MONITORING (Continuous)
   ↓
2. RISK DETECTION (risk_score > 50)
   ↓
3. ADMIN NOTIFICATION (🟡/🔴 Banner)
   ↓
4. SIMULATE REPLANNING (AI generates new plan)
   ↓
5. ADMIN REVIEW (Modal with proposed changes)
   ↓
6. APPLY REPLANNING (Admin approves)
   ↓
7. PROJECT DEPLOYMENT (Status → FINALIZED)
   ↓
8. EMPLOYEE NOTIFICATIONS (Task assignments sent)
   ↓
9. PORTFOLIO UPDATE (Project appears in dashboard)
   ↓
10. EMPLOYEE DASHBOARD UPDATE (Tasks appear, notifications visible)
```

---

## 📋 Step-by-Step Implementation

### Step 1: Health Monitoring

**Location**: `ProjectDetailsPage.jsx` (Active Core)

**Frequency**: Every 15 seconds

**API Call**:
```javascript
GET /projects/{project_id}/health
```

**Response**:
```json
{
  "health": "critical",
  "issues": ["unassigned_tasks", "deadline_critical"],
  "metrics": {
    "progress": 30,
    "expected_progress": 60,
    "days_left": 2,
    "max_load": 6,
    "risk_score": 100,
    "total_tasks": 10,
    "completed": 3,
    "in_progress": 2,
    "unassigned": 5
  }
}
```

**UI Display**:
- 🟢 Green banner: risk_score < 50
- 🟡 Yellow banner: risk_score 50-99
- 🔴 Red banner: risk_score ≥ 100

---

### Step 2: Risk Detection

**Backend Logic** (`projects.py`):

```python
# Calculate risk score
risk_score = 0

# Progress behind schedule
if progress < (expected_progress - 15):
    risk_score += 30

# Deadline risks
if days_left < 0:
    risk_score += 50
elif days_left < 3:
    risk_score += 20
elif days_left < 7:
    risk_score += 10

# Unassigned tasks
if len(unassigned_tasks) > 0:
    risk_score += 50

# Employee overload
if load > 5 or load_percentage > 90:
    risk_score += 40
elif load > 3 or load_percentage > 75:
    risk_score += 15
```

---

### Step 3: Admin Notification

**UI Component**: Health Status Banner

**Display Logic**:
```javascript
{healthData && (
  <div className={`banner ${
    healthData.health === 'critical' ? 'border-red-500' :
    healthData.health === 'warning' ? 'border-amber-500' :
    'border-emerald-500'
  }`}>
    {/* Health indicator, metrics, action button */}
  </div>
)}
```

**Action Button**:
- Warning state: "Review Optimization"
- Critical state: "Run Replanning"

---

### Step 4: Simulate Replanning

**Trigger**: Admin clicks replanning button

**API Call**:
```javascript
POST /projects/{project_id}/replan-simulate
```

**Backend Process**:
1. Extract project context (title, description, skills, deadline)
2. Call PlannerAgent to generate new task breakdown
3. Call MatchingAgent to assign tasks to employees
4. Return proposed plan without saving

**Response**:
```json
{
  "proposed_tasks": [
    {
      "title": "Setup Authentication System",
      "description": "...",
      "required_skills": ["Python", "FastAPI"],
      "estimated_hours": 8,
      "deadline": "2026-02-10"
    }
  ],
  "proposed_assignments": [
    {
      "profile": {
        "_id": "...",
        "full_name": "John Doe",
        "avatar_url": "..."
      },
      "suggested_task": "Setup Authentication System",
      "score": 95
    }
  ],
  "summary": "Proposed re-distribution of 8 tasks across 3 agents."
}
```

---

### Step 5: Admin Review

**UI Component**: Simulation Modal

**Features**:
- Full-screen overlay
- Proposed tasks list with skills and deadlines
- Proposed team assignments with match scores
- Cancel/Apply buttons

**User Actions**:
- Review proposed changes
- Click "Cancel" to reject
- Click "Apply Neural Plan" to accept

---

### Step 6: Apply Replanning

**Trigger**: Admin clicks "Apply Neural Plan"

**API Call**:
```javascript
POST /projects/{project_id}/replan-apply
Body: {
  tasks: simulationData.proposed_tasks,
  assignments: simulationData.proposed_assignments
}
```

**Backend Process**:
1. Update project tasks with new assignments
2. Update assigned_team list
3. **Set project status to FINALIZED** 🚀
4. **Send notifications to all employees** 📧
5. Return success response

**Response**:
```json
{
  "status": "success",
  "message": "Neural replan applied successfully. Project deployed to portfolio.",
  "project_status": "finalized",
  "notifications_sent": 3,
  "tasks_updated": 8,
  "team_size": 3
}
```

---

### Step 7: Project Deployment

**Backend Code** (`projects.py`):
```python
# 🚀 FINALIZE PROJECT (Deploy to Portfolio)
project.status = ProjectStatus.FINALIZED
await project.save()
```

**Effect**:
- Project status changes from DRAFT → FINALIZED
- Project becomes visible in admin portfolio
- Project appears in employee "My Projects" list

---

### Step 8: Employee Notifications

**Backend Code** (`projects.py`):
```python
# 📧 SEND NOTIFICATIONS TO EMPLOYEES
for employee_id, tasks_list in task_assignments.items():
    notification = Notification(
        employee_id=employee_id,
        project_id=project.id,
        notification_type=NotificationType.REPLANNING_APPLIED,
        title=f"🔄 New Tasks Assigned - {project.title}",
        message=f"You have been assigned {task_count} tasks...",
        read=False
    )
    await notification.insert()
```

**Notification Model**:
```python
class Notification(Document):
    employee_id: PydanticObjectId
    project_id: Optional[PydanticObjectId]
    notification_type: str  # "replanning_applied"
    title: str
    message: str
    read: bool = False
    created_at: datetime
```

---

### Step 9: Portfolio Update

**Location**: `AdminDashboardPage.jsx`

**API Call**:
```javascript
GET /projects/
```

**Filter**:
```javascript
const finalizedProjects = projects.filter(p => p.status === 'finalized');
```

**Display**:
- Project card in portfolio grid
- Shows title, team members, progress
- "View Details" button navigates to Active Core

---

### Step 10: Employee Dashboard Update

**Location**: `EmployeeMissionBoard.jsx`

**Features**:

#### A. Task Visibility
```javascript
GET /projects/my-projects
```
- Filters tasks assigned to current employee
- Displays in Kanban board (Backlog/In Progress/Completed)

#### B. Notification Bell
```javascript
GET /notifications/unread
```
- Shows unread count badge
- Dropdown panel with recent notifications
- Click to mark as read

**UI Elements**:
- 🔔 Notification bell in header
- Red badge with unread count
- Dropdown panel with notification list
- Auto-refresh every 10 seconds

---

## 🔧 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/projects/{id}/health` | GET | Get health status |
| `/projects/{id}/replan-simulate` | POST | Generate simulation |
| `/projects/{id}/replan-apply` | POST | Apply replanning + deploy |
| `/projects/` | GET | List all projects |
| `/projects/my-projects` | GET | Get employee's projects |
| `/notifications/unread` | GET | Get unread notifications |
| `/notifications/{id}/read` | PUT | Mark notification as read |

---

## 📊 Database Models

### Project
```python
class Project(Document):
    title: str
    description: str
    status: ProjectStatus  # DRAFT, FINALIZED
    tasks: List[Task]
    assigned_team: List[PydanticObjectId]
    deadline: Optional[str]
    created_at: datetime
    updated_at: datetime
```

### Notification
```python
class Notification(Document):
    employee_id: PydanticObjectId
    project_id: Optional[PydanticObjectId]
    notification_type: str
    title: str
    message: str
    read: bool
    created_at: datetime
```

---

## 🎨 Frontend Components

### 1. ProjectDetailsPage.jsx
- Health status banner (🟢🟡🔴)
- Replanning button
- Simulation modal
- Success message with deployment details

### 2. EmployeeMissionBoard.jsx
- Notification bell with badge
- Notification dropdown panel
- Kanban board with tasks
- Real-time updates (10s polling)

### 3. AdminDashboardPage.jsx
- Portfolio grid with finalized projects
- Project cards with team info
- Navigation to Active Core

---

## 🧪 Testing Workflow

### Test Case 1: Complete Replanning Flow

1. **Setup**:
   - Create project with 5 tasks
   - Leave 3 tasks unassigned
   - Set deadline to 2 days from now

2. **Expected Results**:
   - Health banner shows 🔴 Critical
   - Risk score ≥ 100
   - "Run Replanning" button appears

3. **Actions**:
   - Click "Run Replanning"
   - Wait for simulation (~5-10s)
   - Review proposed changes
   - Click "Apply Neural Plan"

4. **Verify**:
   - Success message shows deployment details
   - Redirects to portfolio after 1.5s
   - Project appears in portfolio
   - Employees receive notifications
   - Tasks appear in employee dashboards

### Test Case 2: Employee Notification Flow

1. **Setup**:
   - Apply replanning from Test Case 1
   - Login as assigned employee

2. **Expected Results**:
   - Notification bell shows unread count
   - Dropdown shows new task notification
   - Tasks appear in Kanban board

3. **Actions**:
   - Click notification bell
   - Click on notification to mark as read

4. **Verify**:
   - Unread count decreases
   - Notification marked as read
   - Tasks visible in appropriate columns

---

## 🚀 Deployment Checklist

- [x] Notification model created
- [x] Notifications API implemented
- [x] Notification routes registered
- [x] Database initialization updated
- [x] Replan-apply endpoint enhanced
- [x] Frontend notification UI added
- [x] Health monitoring integrated
- [x] Simulation modal implemented
- [x] Success message with deployment details
- [x] Auto-navigation to portfolio
- [x] Real-time notification polling

---

## 📝 Key Features

✅ **Real-time Health Monitoring** - Continuous risk assessment  
✅ **AI-Powered Replanning** - Intelligent task redistribution  
✅ **Simulation-First Approach** - Preview before applying  
✅ **Automatic Deployment** - Project finalized on apply  
✅ **Employee Notifications** - Real-time task assignments  
✅ **Portfolio Integration** - Deployed projects visible  
✅ **Notification System** - Unread badges and dropdowns  
✅ **User Control** - Admin approval required  

---

## 🎯 Success Metrics

1. **Health Detection**: Risk score accurately reflects project state
2. **Replanning Quality**: AI generates valid task distributions
3. **Deployment Speed**: Project finalized in < 2 seconds
4. **Notification Delivery**: 100% of employees notified
5. **UI Responsiveness**: Real-time updates within 10 seconds

---

**Status**: ✅ FULLY IMPLEMENTED AND OPERATIONAL

**Version**: 1.0.0

**Last Updated**: 2026-02-07
