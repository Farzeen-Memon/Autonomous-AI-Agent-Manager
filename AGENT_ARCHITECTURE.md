# NEXO: Agentic Architecture & Neural Intelligence
**Principal Architect Documentation**  
**Focus:** Deep Internal Logic of Autonomous Agents

---

## 🏗️ 1. The Multi-Agent Swarm
NEXO operates on a "Swarm Architecture" where specialized agents collaborate to manage the project lifecycle. Unlike linear software, NEXO agents are **non-deterministic** and use LLMs (Llama 3 / Gemini) to interpret project context and employee potential.

---

## 🧠 2. Planner Agent (The Architect)
The **Planner Agent** is responsible for converting a high-level "Vision" into a low-level "Backlog."

### Core Logic: Sequential Phasing
The Planner follows a **Sequential Dependency Rule**. It is programmed to understand that software cannot be deployed before it is built. It bucketizes tasks into three phases:
1.  **Early Phase:** Infrastructure, Database Schema, Authentication.
2.  **Middle Phase:** Business Logic, Frontend UI, API Integration.
3.  **Late Phase:** Testing, DevOps, Production Deployment.

### Operation Modes:
*   **Standard Mode:** Focuses on code quality and logical implementation sequences (Fixed at 10 tasks for consistency).
*   **Crisis Mode (Overdue):** Triggered when the current date is past the project deadline. The agent switches to "Aggressive Recovery," cutting nice-to-have features and focusing strictly on the **Critical Path** to MVP.

---

## 🎯 3. Matcher Agent (The Talent Scout)
The **Matcher Agent** is the most complex component. It doesn't just look for keywords; it performs **semantic skill-vector matching**.

### The Scoring Algorithm (0 - 20)
*   **18 - 20 (Perfect Match):** Employee has the exact tech stack (e.g., FastAPI + Beanie) and the required years of experience.
*   **14 - 17 (Strong Match):** Employee has the core language (Python) but perhaps not the specific library, or slightly less experience.
*   **0 (Zero-Match Rule):** If an employee has **zero** matching skills, they are assigned a score of 0. This prevents "hallucinated" assignments.

### Personalized Technical Briefings
The Matcher doesn't just assign a name; it generates a **Personalized Implementation Briefing** for every team member. This includes:
*   **Suggested Task:** A specific module from the Planner's backlog.
*   **Neural Load:** Estimated hours based on the complexity of the task.
*   **Reasoning:** A plain-English explanation of why this specific dev was picked (e.g., *"Aarav's 6+ years of Python expertise is critical for the Database Schema optimization."*).

---

## 📉 4. Replanning Agent (The Optimizer)
The **Replanning Agent** provides the "Self-Healing" capability of NEXO. It continuously monitors the **Risk Score**.

### Risk Score Matrix
The agent aggregates points to determine the "Neural Health" of the project:
| Risk Factor | Weight | Impact |
| :--- | :---: | :--- |
| **Past Deadline** | +50 | Triggers "Overdue" status immediately |
| **Unassigned Tasks** | +50 | Triggers "Critical" status |
| **Overloaded (>90%)** | +40 | High risk of burnout/bottleneck |
| **Behind Schedule** | +30 | Current progress < Expected (Time-based calculation) |
| **Near Capacity (>75%)** | +15 | Warning state |

### The Simulation-Apply Workflow
1.  **Simulation:** The agent generates a "Proposed Plan" in a sandboxed memory space.
2.  **Diff Generation:** It calculates exactly which tasks need to be **rerouted** from one developer to another.
3.  **Apply:** Once confirmed, it sends **Rerouted Notifications** to old assignees and **Activation Briefings** to new ones.

---

## 🛠️ 5. Team Selection Agent (The Strategist)
This agent acts as a gateway between AI recommendations and Admin preferences.

### Selection Strategies:
1.  **Auto Strategy:** Operates on a "Greedy Algorithm." It selects the top $N$ candidates based on the Matcher's score.
2.  **Manual (Locked) Strategy:** Admins can "Lock" specific employees. The agent then dynamically recalculates the remaining $N-k$ slots to find the best complementary skills to support the locked members.

---

## 📡 6. Communication Model (Event-Driven)
Agents communicate through the **State Manager** in the FastAPI backend:
*   `GET /health` triggers the **Replanning Agent**'s assessment logic.
*   `POST /match-preview` triggers the **Planner + Matcher** pipeline in sequence.
*   `POST /replan-apply` triggers the **Selection Agent** to persist the neural state.

---
**This architecture ensures NEXO doesn't just track projects—it actively solves them.**
