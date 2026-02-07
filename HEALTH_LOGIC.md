# Nexo Project Health Logic

This document outlines the logic used to determine project health states (`stable`, `overdue`, `critical`, `warning`) and the associated risk scores.

## 1. State Determination Priority

The system checks for conditions in this specific order:

### 🔴 OVERDUE
**Condition:** `days_left < 0` (Current date is past the deadline)
- **Effect:** Immediate replanning required. Recovery mode activated.
- **Risk Score Impact:** +50

### 🔴 CRITICAL
**Conditions (Any of these):**
1.  **Unassigned Tasks:** Any tasks without an assignee.
    - *Risk Score:* +50 (Severe blocker)
2.  **Severe Capacity Overload:** Any employee has `> 5 active tasks` OR `> 90% utilization`.
    - *Risk Score:* +40
3.  **Approaching Deadline:** `days_left < 3` (and not overdue)
    - *Risk Score:* +20

### 🟡 WARNING
**Conditions (Any of these, if not overdue/critical):**
1.  **Deadline Approaching:** `days_left < 7`
    - *Risk Score:* +10
2.  **Progress Lag:** `actual_progress < (expected_progress - 15%)`
    - *Risk Score:* +30
3.  **Capacity Strain:** Any employee has `> 3 active tasks` OR `> 75% utilization`.
    - *Risk Score:* +15

### 🟢 STABLE
**Condition:** None of the above issues are detected.
- **Risk Score:** 0

## 2. Risk Score & Replanning Logic

- **Risk Score > 50**: Automatically suggests **Run Replanning**.
- **State = OVERDUE**: automatically switches Replanning Agent to **Recovery Mode** (aggressive scheduling, critical path focus).

## 3. Metric Definitions
- **Utilization**: Calculated based on estimated task hours vs. 40-hour work week.
- **Expected Progress**: Linear interpolation from project start to deadline.
