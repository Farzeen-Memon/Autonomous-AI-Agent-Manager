# Replanning Agent - Quick Reference

## 🎯 What It Does
Automatically monitors project health and suggests AI-powered optimizations when risks are detected.

---

## 🟢🟡🔴 Health States

### 🟢 STABLE
- **Risk Score**: < 50
- **UI**: Green banner, no action needed
- **Message**: "All systems operational"

### 🟡 WARNING  
- **Risk Score**: 50-99
- **Triggers**: 
  - Workload > 75%
  - Deadline < 7 days
  - Progress behind schedule
- **UI**: Yellow banner + "Review Optimization" button

### 🔴 CRITICAL
- **Risk Score**: ≥ 100
- **Triggers**:
  - Deadline overdue/< 3 days
  - Unassigned tasks
  - Workload > 90%
- **UI**: Red banner + "Run Replanning" button

---

## 📊 Risk Score Formula

| Issue | Points |
|-------|--------|
| Progress behind schedule | +30 |
| Deadline < 7 days | +10 |
| Deadline < 3 days | +20 |
| Deadline overdue | +50 |
| Unassigned tasks | +50 |
| Workload > 75% | +15 |
| Workload > 90% | +40 |

**Threshold**: Score > 50 = Replanning recommended

---

## 🔄 Workflow

```
1. MONITOR (every 15s)
   ↓
2. DETECT RISK (risk_score > 50)
   ↓
3. SHOW BANNER (🟡 or 🔴)
   ↓
4. USER CLICKS "Run Replanning"
   ↓
5. AI SIMULATES new plan
   ↓
6. SHOW MODAL with proposed changes
   ↓
7. USER REVIEWS and clicks "Apply"
   ↓
8. SYSTEM UPDATES project
```

---

## 🚀 How to Use

### On Active Core Page (ProjectDetailsPage)

1. **View Health Status**
   - Health banner appears below project title
   - Shows current state (🟢/🟡/🔴)
   - Displays risk score and metrics

2. **Trigger Replanning** (if 🟡 or 🔴)
   - Click "Run Replanning" or "Review Optimization"
   - Wait for AI simulation (~5-10 seconds)
   - Review proposed changes in modal

3. **Review Simulation**
   - See new task breakdown
   - See new team assignments
   - Compare with current state

4. **Apply or Cancel**
   - Click "Apply Neural Plan" to accept
   - Click "Cancel" to keep current plan
   - System refreshes automatically

---

## 🧪 Testing

### Create Critical State
```python
# Option 1: Unassigned tasks
- Create project with tasks
- Leave some tasks unassigned
→ 🔴 Critical

# Option 2: Overloaded employee
- Assign 6+ tasks to one person
→ 🔴 Critical

# Option 3: Deadline pressure
- Set deadline to yesterday
→ 🔴 Critical
```

### Create Warning State
```python
# Option 1: Moderate workload
- Assign 4 tasks to one person
→ 🟡 Warning

# Option 2: Approaching deadline
- Set deadline to 5 days from now
→ 🟡 Warning
```

---

## 📡 API Endpoints

```
GET  /projects/{id}/health
→ Returns health status and metrics

POST /projects/{id}/replan-simulate  
→ Generates AI simulation

POST /projects/{id}/replan-apply
→ Applies simulated plan
```

---

## 💡 Key Features

✅ **Real-time Monitoring** - Checks health every 15 seconds  
✅ **Smart Risk Scoring** - Multi-factor risk calculation  
✅ **AI-Powered** - Uses LLM for task planning and matching  
✅ **Simulation-First** - Preview before applying  
✅ **User Control** - Admin must approve all changes  
✅ **Visual Feedback** - Color-coded states and metrics  

---

## 🎨 UI Components

### Health Banner
- Color-coded border and background
- Health icon (✓/⚠/✗)
- Risk score badge
- Issue tags
- Metrics display (Progress, Days Left, Max Load)
- Action button (if needed)

### Simulation Modal
- Proposed task list with skills
- Proposed team assignments with scores
- Cancel/Apply buttons
- Full-screen overlay

---

## 🔧 Configuration

### Backend (`app/api/projects.py`)
- Health calculation logic
- Risk score thresholds
- Workload limits (40h/week)

### Frontend (`ProjectDetailsPage.jsx`)
- Polling interval (15s)
- Health state colors
- Modal styling

---

## 📝 Files Modified

### Backend
- `d:\Nexo\backend\app\api\projects.py` - Enhanced health endpoint

### Frontend  
- `d:\Nexo\frontend\src\pages\ProjectDetailsPage.jsx` - Added health UI

### Documentation
- `d:\Nexo\REPLANNING_AGENT_GUIDE.md` - Full guide
- `d:\Nexo\REPLANNING_QUICK_REFERENCE.md` - This file

---

## ✨ Example

**Before Replanning:**
- 10 tasks
- 8 assigned to Alice
- 2 assigned to Bob
- Risk Score: 40 (🔴 Critical)

**After Replanning:**
- 10 tasks
- 5 assigned to Alice
- 5 assigned to Bob
- Risk Score: 0 (🟢 Stable)

---

## 🎯 Success Criteria

✅ Health banner displays correct state  
✅ Risk score calculated accurately  
✅ Replanning button appears when needed  
✅ Simulation generates valid plan  
✅ Apply updates project correctly  
✅ UI refreshes after apply  

---

**Status**: ✅ FULLY IMPLEMENTED AND OPERATIONAL
