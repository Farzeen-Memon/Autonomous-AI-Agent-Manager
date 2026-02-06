# Replanning Agent System - Complete Guide

## Overview
The Replanning Agent is an AI-powered system that continuously monitors project health and automatically suggests optimizations when risks are detected. It follows a **Simulation-First** approach to maintain user control while providing intelligent recommendations.

---

## 🟢🟡🔴 Health States

### 🟢 Stable (Green)
- **Condition**: All metrics within acceptable thresholds
- **Risk Score**: < 50
- **UI Behavior**: Green banner, no action button
- **Description**: "All systems operational. Project tracking within parameters."

### 🟡 Warning (Yellow)
- **Condition**: Minor risks detected
- **Risk Score**: 50-99
- **Triggers**:
  - Employee workload > 75% (3-4 active tasks or 30-40 hours)
  - Deadline < 7 days
  - Progress 15% behind expected schedule
- **UI Behavior**: Yellow banner, "Review Optimization" button
- **Description**: "Minor risks detected. Consider optimization review."

### 🔴 Critical (Red)
- **Condition**: Major risks detected
- **Risk Score**: ≥ 100
- **Triggers**:
  - Deadline overdue or < 3 days
  - Unassigned tasks exist
  - Employee workload > 90% (5+ active tasks or 40+ hours)
- **UI Behavior**: Red banner, "Run Replanning" button
- **Description**: "Major risks detected. Immediate replanning recommended."

---

## Risk Score Calculation

The system calculates a cumulative risk score based on multiple factors:

| Factor | Condition | Points Added |
|--------|-----------|--------------|
| **Progress Behind Schedule** | Actual progress < (Expected - 15%) | +30 |
| **Deadline Approaching** | < 7 days remaining | +10 |
| **Deadline Critical** | < 3 days remaining | +20 |
| **Deadline Overdue** | Past deadline | +50 |
| **Unassigned Tasks** | Any task without owner | +50 |
| **Capacity Near Limit** | Load > 75% | +15 |
| **Capacity Critical** | Load > 90% | +40 |

**Threshold**: Risk score > 50 triggers replanning recommendation

---

## How the Replanning Agent Works

### 1. Health Monitoring (Continuous)
- **Endpoint**: `GET /projects/{project_id}/health`
- **Frequency**: Every 15 seconds (frontend polling)
- **Inputs Watched**:
  - Task progress vs expected progress
  - Employee workload (tasks + hours)
  - Deadline proximity
  - Unassigned/blocked tasks

### 2. Trigger Condition
```
IF (risk_score > 50) THEN
  → Display health banner with appropriate state
  → Show "Run Replanning" or "Review Optimization" button
END IF
```

### 3. Simulation Phase (User-Initiated)
When admin clicks the replanning button:

**Endpoint**: `POST /projects/{project_id}/replan-simulate`

**Process**:
1. **Task Decomposition**: AI regenerates task breakdown based on current project state
2. **Employee Matching**: AI matches employees to new tasks based on skills and availability
3. **Diff Generation**: System compares current vs proposed plan

**Response**:
```json
{
  "proposed_tasks": [...],
  "proposed_assignments": [...],
  "summary": "Proposed re-distribution of X tasks across Y agents."
}
```

### 4. Review Phase (Modal Display)
The frontend displays a modal showing:
- **Proposed Tasks**: New task breakdown with skills and deadlines
- **Proposed Assignments**: Team member assignments with match scores
- **Git-diff Style Comparison**: Visual comparison of changes

### 5. Application Phase (User Approval)
**Endpoint**: `POST /projects/{project_id}/replan-apply`

**Payload**:
```json
{
  "tasks": [...],
  "assignments": [...]
}
```

**Process**:
1. Update project tasks with new breakdown
2. Reassign tasks to team members
3. Update assigned_team list
4. Refresh project data

---

## Frontend Integration

### State Management
```javascript
const [healthData, setHealthData] = useState({ 
  health: 'stable', 
  issues: [], 
  metrics: {} 
});
const [simulationData, setSimulationData] = useState(null);
const [isSimulating, setIsSimulating] = useState(false);
const [isApplying, setIsApplying] = useState(false);
const [showSimulation, setShowSimulation] = useState(false);
```

### Health Polling
```javascript
useEffect(() => {
  const healthInterval = setInterval(fetchHealth, 15000);
  return () => clearInterval(healthInterval);
}, [projectId]);
```

### Trigger Replanning
```javascript
const handleSimulateReplan = async () => {
  setIsSimulating(true);
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/replan-simulate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setSimulationData(data);
  setShowSimulation(true);
  setIsSimulating(false);
};
```

### Apply Replanning
```javascript
const handleApplyReplan = async () => {
  setIsApplying(true);
  await fetch(`${API_BASE_URL}/projects/${projectId}/replan-apply`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      tasks: simulationData.proposed_tasks,
      assignments: simulationData.proposed_assignments
    })
  });
  setShowSimulation(false);
  fetchProjectDetails(); // Refresh
  setIsApplying(false);
};
```

---

## Backend Architecture

### Health Calculation Logic
```python
# Calculate expected progress based on time elapsed
if project.deadline:
    created_dt = project.created_at
    deadline_dt = datetime.fromisoformat(project.deadline)
    total_duration = (deadline_dt - created_dt).days
    elapsed = (datetime.utcnow() - created_dt).days
    expected_progress = (elapsed / total_duration) * 100

# Compare actual vs expected
if progress < (expected_progress - 15):
    risk_score += 30
    health = "warning"
```

### Workload Analysis
```python
employee_loads = {}
employee_hours = {}

for task in project.tasks:
    if task.assigned_to and task.status != "completed":
        eid = str(task.assigned_to)
        employee_loads[eid] = employee_loads.get(eid, 0) + 1
        hours = getattr(task, 'estimated_hours', 8)
        employee_hours[eid] = employee_hours.get(eid, 0) + hours

# Check for overload
for eid, load in employee_loads.items():
    hours = employee_hours.get(eid, 0)
    load_percentage = (hours / 40) * 100  # 40h/week capacity
    
    if load > 5 or load_percentage > 90:
        risk_score += 40
        health = "critical"
```

---

## Testing the System

### 1. Create a Test Project
- Create a project with a tight deadline (< 7 days)
- Add multiple tasks
- Assign all tasks to one employee

### 2. Trigger Warning State
- Set deadline to 5 days from now
- Assign 4 tasks to one employee
- Expected: Yellow banner with "Review Optimization"

### 3. Trigger Critical State
- Leave tasks unassigned, OR
- Set deadline to past date, OR
- Assign 6+ tasks to one employee
- Expected: Red banner with "Run Replanning"

### 4. Test Replanning Flow
1. Click "Run Replanning" button
2. Wait for simulation (AI generates new plan)
3. Review proposed changes in modal
4. Click "Apply Neural Plan" to accept
5. Verify tasks are redistributed

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/projects/{id}/health` | GET | Get current health status |
| `/projects/{id}/replan-simulate` | POST | Generate replanning simulation |
| `/projects/{id}/replan-apply` | POST | Apply simulated replan |

---

## Future Enhancements

1. **Dependency Tracking**: Monitor blocked tasks waiting on dependencies
2. **Historical Trends**: Track health over time, predict future risks
3. **Auto-Replanning**: Optional automatic replanning for critical states
4. **Custom Thresholds**: Allow admins to configure risk score thresholds
5. **Notification System**: Email/Slack alerts when health degrades
6. **Rollback Support**: Undo replanning if results are unsatisfactory

---

## Troubleshooting

### Health Not Updating
- Check browser console for fetch errors
- Verify backend is running on port 8000
- Ensure project has tasks and deadline set

### Simulation Fails
- Check backend logs for LLM errors
- Verify `LLM_API_KEY` is set in `.env`
- Ensure employees exist in database

### Apply Fails
- Check task format matches expected schema
- Verify employee IDs are valid ObjectIds
- Check backend logs for validation errors

---

## Example Scenarios

### Scenario 1: Deadline Approaching
- **Initial State**: Project with 10 days remaining, 50% complete
- **After 8 days**: 2 days remaining, still 50% complete
- **Health**: 🔴 Critical (deadline_critical + progress_behind_schedule)
- **Risk Score**: 20 + 30 = 50
- **Action**: "Run Replanning" appears

### Scenario 2: Overloaded Employee
- **Initial State**: 3 employees, 15 tasks evenly distributed
- **After Reassignment**: 1 employee has 10 tasks, others have 2-3
- **Health**: 🔴 Critical (capacity_critical_overload)
- **Risk Score**: 40
- **Action**: Replanning redistributes tasks across team

### Scenario 3: Unassigned Tasks
- **Initial State**: New project created with 8 tasks
- **Current State**: Only 3 tasks assigned, 5 unassigned
- **Health**: 🔴 Critical (unassigned_tasks)
- **Risk Score**: 50
- **Action**: Replanning assigns all tasks to available team members

---

## Conclusion

The Replanning Agent provides intelligent, AI-powered project optimization while maintaining full admin control through the simulation-first workflow. It continuously monitors project health and proactively suggests improvements when risks are detected.
