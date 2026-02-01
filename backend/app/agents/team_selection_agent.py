from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class TeamSelectionAgent:
    """
    Agent 2: Team Selection Agent.
    Decides the final team based on strategy (Auto vs Manual) and constraints.
    """

    def select_team(
        self,
        matches: List[Dict[str, Any]],
        team_size: int,
        strategy: str = "auto", # 'auto' or 'manual'
        locked_employee_ids: Optional[List[str]] = None,
        priority: str = "Standard"
    ) -> Dict[str, Any]:
        """
        Selects the final team from a list of scored matches.
        
        Args:
            matches: List of dicts containing employee match data (must have 'match_score' and 'employee_id').
            team_size: Target size of the team.
            strategy: 'auto' or 'manual'.
            locked_employee_ids: List of IDs that must be included (for manual strategy).
            priority: Project priority (could affect score thresholds).

        Returns:
            Dict containing:
            - 'selected_team': List of selected employee objects.
            - 'selection_reasoning': String explaining the selection.
        """
        
        # Ensure matches are sorted by score
        # Handle different key names if necessary, assuming 'match_score' or 'score'
        def get_score(m):
            return float(m.get('match_score', m.get('score', 0)))
            
        sorted_matches = sorted(matches, key=get_score, reverse=True)
        
        selected_team = []
        reasoning = []
        
        locked_ids = set(locked_employee_ids or [])
        
        # 1. Handle Locked Candidates (Manual Strategy)
        if hasattr(locked_ids, '__len__') and len(locked_ids) > 0:
            locked_candidates = [m for m in sorted_matches if str(m.get('employee_id', m.get('id'))) in locked_ids]
            selected_team.extend(locked_candidates)
            reasoning.append(f"Locked {len(locked_candidates)} users manually.")
            
        # 2. Fill Remaining Slots
        remaining_slots = team_size - len(selected_team)
        
        if remaining_slots > 0:
            # Filter available candidates (not already selected/locked)
            selected_ids = {str(m.get('employee_id', m.get('id'))) for m in selected_team}
            available_candidates = [m for m in sorted_matches if str(m.get('employee_id', m.get('id'))) not in selected_ids]
            
            # TODO: Apply Priority constraints?
            # e.g. If Priority is Critical, maybe only take score > 15
            
            auto_fills = available_candidates[:remaining_slots]
            selected_team.extend(auto_fills)
            reasoning.append(f"Auto-filled {len(auto_fills)} optimal candidates based on score.")
        
        elif remaining_slots < 0:
            # If we have too many locked candidates, we treat them all as selected (ignoring team size limit for locks)
            reasoning.append(f"Manual selection ({len(selected_team)}) exceeds target team size ({team_size}). Keeping all selections.")

        result = {
            "selected_team": selected_team,
            "selection_reasoning": " ".join(reasoning)
        }
        
        return result
