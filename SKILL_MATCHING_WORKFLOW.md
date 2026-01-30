# Skill Matching System - Complete Workflow

## 🎯 Overview
The Nexo skill matching system uses AI to automatically recommend employees for projects based on their skills. Here's exactly how it works:

---

## 📊 Data Flow Architecture

```
USER TYPES SKILL → Frontend → Backend API → Database Query → AI Matcher → Scored Results → Frontend Display
```

---

## 🔄 Step-by-Step Workflow

### **Step 1: User Input (Frontend)**
**File:** `frontend/src/pages/ProjectMatchingPage.jsx`

- User types a skill (e.g., "Python") in the "Expertise Required" field
- Frontend waits 500ms (debounce) to avoid excessive API calls
- Triggers `handleAutoDistribute()` function

**What happens:**
```javascript
// Skills are collected
skills = ["Python", "React", "AWS"]

// Sent to backend as:
{
  "title": "My Project",
  "required_skills": [
    {"skill_name": "Python", "level": "mid"},
    {"skill_name": "React", "level": "mid"}
  ],
  "experience_required": 2
}
```

---

### **Step 2: API Endpoint (Backend)**
**File:** `backend/app/api/projects.py`
**Endpoint:** `POST /projects/match-preview`

**What happens:**
1. Receives project data from frontend
2. Queries MongoDB for ALL employees with role "employee"
3. For each employee, fetches their profile + skills
4. Passes this data to the Matcher Agent

**Code Flow:**
```python
# Get all employee users
employees_users = await User.find(User.role == UserRole.EMPLOYEE).to_list()

# Get their profiles
profiles = await EmployeeProfile.find(...)

# For each profile, get skills
for profile in profiles:
    skills = await Skill.find(Skill.employee_id == profile.id).to_list()
    candidates.append({"profile": profile, "skills": skills})
```

---

### **Step 3: AI Matching (Matcher Agent)**
**File:** `backend/app/agents/matcher_agent.py`

**What happens:**
1. Formats project requirements and candidate data
2. Sends to AI (Groq/Gemini) with specific instructions
3. AI analyzes each candidate against required skills
4. Returns scored matches with reasoning

**AI Instructions:**
- **MUST include** anyone with at least ONE matching skill
- Score 10-13: Has at least one matching skill
- Score 14-17: Has several matching skills
- Score 18-20: Perfect match (all skills)

**Example AI Response:**
```json
{
  "matches": [
    {
      "employee_id": "697989f3b737dd7e02efc528",
      "employee_name": "Aarav Kumar",
      "match_score": 17.5,
      "matched_skills": ["Python", "ML"],
      "suggested_task": "Backend Development",
      "reasoning": "Strong Python expertise (6 years) matches core requirement"
    }
  ]
}
```

---

### **Step 4: Results Enrichment (Backend)**
**File:** `backend/app/api/projects.py`

**What happens:**
1. Takes AI matches
2. Enriches with full profile data (avatar, specialization, etc.)
3. Returns to frontend

**Response Format:**
```json
[
  {
    "profile": {
      "id": "...",
      "full_name": "Aarav Kumar",
      "specialization": "ML Engineer",
      "avatar_url": "..."
    },
    "skills": [...],
    "score": 17.5,
    "matched_skills": ["Python", "ML"],
    "reasoning": "..."
  }
]
```

---

### **Step 5: Display Results (Frontend)**
**File:** `frontend/src/pages/ProjectMatchingPage.jsx`

**What happens:**
1. Receives matches from backend
2. Merges with existing employee list
3. Sorts by score (highest first)
4. Displays in UI with color coding:
   - **Green (15-20)**: Excellent match
   - **Yellow (10-14)**: Good match
   - **Red (0-9)**: Weak match

---

## 🗄️ Database Collections

### **users**
```json
{
  "_id": ObjectId,
  "email": "aarav@gmail.com",
  "role": "employee",
  "password_hash": "..."
}
```

### **user_profiles**
```json
{
  "_id": ObjectId,
  "user_id": ObjectId (references users),
  "full_name": "Aarav Kumar",
  "specialization": "ML Engineer",
  "avatar_url": "..."
}
```

### **skills**
```json
{
  "_id": ObjectId,
  "employee_id": ObjectId (references user_profiles),
  "skill_name": "Python",
  "level": "senior",
  "years_of_experience": 6.0
}
```

---

## 🔧 Current Configuration

### **LLM Provider:** Groq (Free & Fast)
- **Model:** llama3-70b-8192
- **API Key:** Set in `backend/.env`
- **Fallback:** Keyword matching if AI fails

### **Matching Rules:**
1. ✅ Include ALL candidates with ≥1 matching skill
2. ✅ Minimum score of 10 for any match
3. ✅ No limit on number of results
4. ✅ Case-insensitive skill matching

---

## 🐛 Debugging

### **Check Backend Logs:**
Look for these debug prints in your terminal:
```
DEBUG: Found X users with role 'employee'
DEBUG: Found Y profiles linked to these users
DEBUG: Candidate Aarav Kumar has 3 skills: ['ML', 'Python', 'TensorFlow']
LOGGING LLM RESULT: {...}
```

### **Check Frontend Console:**
```
🚀 Sending match request: {...}
✅ Received match results: [...]
🎯 Match found for Aarav Kumar: 17.5
```

---

## 🚀 Quick Test

1. **Go to:** `http://localhost:5173/admin/project-matching`
2. **Type skill:** "Python" (press Enter)
3. **Wait:** 500ms
4. **Expected:** See Aarav Kumar, Ananya Verma, Ishita Reddy (all have Python)

---

## 📝 Sample Data

Current employees in your DB:
- **Aarav Kumar**: ML, Python, TensorFlow
- **Priya Singh**: React, Node.js, MongoDB
- **Rohan Patel**: AWS, Docker, Kubernetes
- **Ananya Verma**: ML, Python, SQL
- **Vikram Sharma**: React, JavaScript, CSS
- **Ishita Reddy**: CI/CD, Jenkins, Python

---

## ⚡ Performance

- **Average Response Time:** 1-2 seconds
- **Groq Speed:** ~500 tokens/second
- **Database Query:** <100ms
- **Total Workflow:** ~2 seconds end-to-end
