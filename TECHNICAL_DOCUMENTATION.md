# NEXO: Autonomous AI Agent Manager — Technical Documentation
**Version:** 1.0.0  
**Role:** Principal Software Architect & AI Systems Designer  
**Target Audience:** Engineering Teams, Reviewers, Stakeholders  

---

## 🔹 1. Project Overview

**NEXO** is a production-grade Autonomous AI Agent Manager (SaaS) designed to automate the heavy lifting of project management, resource allocation, and real-time health monitoring. 

### Core Problem
Traditional project management (like Jira, Trello, or Monday.com) requires significant manual effort to:
1.  Decompose high-level requirements into technical tasks.
2.  Match the right engineers to the right tasks based on specific skill vectors.
3.  Monitor project health and re-calculate plans when deadlines slip or resources are overloaded.

### The NEXO Solution
NEXO replaces the manual Project Manager with a specialized swarm of AI agents that act as the **"Neural Layer"** of the organization.
*   **Real-world Analogy:** Think of NEXO as **"Jira with a built-in Brain."** Instead of simply tracking what humans decided, NEXO recommends the decisions, executes the planning, and triggers recovery protocols autonomously.

---

## 🔹 2. High-Level Architecture

NEXO follows a modern, distributed architecture designed for low latency and high scalability.

### Technical Stack
*   **Frontend:** React 19 + Vite + Tailwind CSS (Cyberpunk/Neural Aesthetic).
*   **Backend:** FastAPI (Python) using asynchronous patterns for high-throughput I/O.
*   **Database:** MongoDB with Beanie ODM for document-to-object mapping.
*   **AI Orchestration:** Groq (Llama 3 70B) and Google Gemini Pro 1.5.
*   **Deployment:** Render (Free Tier), configured via `render.yaml` Blueprints.

### Architectural Diagram
```text
[ USER (Admin/Employee) ]
          ↓
[ Frontend (React/Vite) ] ← (Real-time Health Polling)
          ↓
[ API Gateway (FastAPI) ]
          ↓
[ Agent Orchestrator ] ← (Multi-Model AI Proxy: Groq/Gemini)
      ↙        ↓        ↘
[Planner]  [Matcher]  [Replanner]
      ↘        ↓        ↙
    [ Database (MongoDB) ]
```

---

## 🔹 3. Agent System Overview

NEXO moves beyond "Rule-Based Automation" and enters "Agentic Decision Making."

### Why Agentic Architecture?
*   **Autonomous Agency:** Unlike a script that follows if/else, NEXO agents use LLMs to interpret context. They can handle "ambiguity" (e.g., "Build an auth system" becomes a 10-step security task list).
*   **Event-Driven Communication:** Agents are triggered by specific state changes (e.g., a project is created, or a risk score crosses a threshold).
*   **Simulation-First Approach:** Agents propose changes in a "Staging/Simulation" layer before they are applied, ensuring human-in-the-loop safety.

---

## 🔹 4. Individual Agent Breakdown

### 🔸 Planner Agent
**Purpose:** Decomposes high-level project goals into technical, sequential tasks.
*   **Inputs:** Project Title, Description, Required Skills, Days Remaining.
*   **Outputs:** A JSON object containing 10 distinct tasks with estimated hours, priority, and relative deadlines.
*   **Decision Logic:** Uses "Sequential Dependency" rules (Infrastructure → Auth → Frontend → Testing).
*   **Recovery Mode:** If a project is overdue, it switches to "Crisis Mode" logic, prioritizing critical path tasks and damage control.

### 🔸 Matcher Agent
**Purpose:** Performs granular skill-vector matching between tasks and employees.
*   **Inputs:** Project Requirements, Employee Profiles (including specialized skills and years of experience).
*   **Outputs:** Ranked candidate list with scores (0-20), suggested tasks, and implementation reasoning.
*   **Decision Logic:** Uses a weighted "Zero-Match Rule"—if a candidate lacks 100% of the core skills, they are discarded to ensure quality.

### 🔸 Team Selection Agent
**Purpose:** Finalizes the project team based on organizational strategy.
*   **Inputs:** Match results, Target Team Size, Strategy (Auto vs Manual), Locked IDs.
*   **Decision Logic:**
    *   **Auto:** Fills slots using the highest-scored candidates from the Matcher Agent.
    *   **Manual:** Prioritizes admin-locked candidates and auto-fills remaining gaps.

### 🔸 Replanning / Recovery Agent
**Purpose:** Monitors project health and generates optimization/recovery plans.
*   **Triggers:** Risk Score > 50 (Warning) or > 100 (Critical).
*   **Risk Factors:** Overdue deadlines (+50), Overloaded employees (+40), Unassigned tasks (+50).
*   **Outputs:** A "Neural Plan" comparing the current failing state vs. the proposed optimized state.
*   **Failure Handling:** If the AI fails to generate a plan, the system falls back to a time-based conservative heuristic.

---

## 🔹 5. End-to-End Project Flow

1.  **Drafting:** Admin creates a project. The **Planner Agent** immediately generates a 10-step technical roadmap.
2.  **Matching:** The **Matcher Agent** scans the employee database. It calculates thousands of permutations to find the optimal team-to-task fit.
3.  **Deployment:** Admin confirms the plan. Tasks are dispatched to employees, and the project status moves to "Active."
4.  **Monitoring:** The **Health Agent** polls metrics every 15 seconds. It calculates a "Risk Score" based on real-time task completion vs. deadline proximity.
5.  **Recovery:** If an employee falls behind, the **Replanning Agent** triggers a "Simulation." It proposes moving tasks to under-utilized members or extending deadlines.
6.  **Finalization:** Once all tasks are marked "Completed" by employees, the Admin reviews the final deliverables and archives the project.

---
**NEXO: Redefining Agency through Neural Orchestration.**
