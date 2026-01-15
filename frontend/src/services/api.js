import { API_BASE_URL } from "../utils/constants";

export const fetchWorkspaces = async () => {
    const response = await fetch(`${API_BASE_URL}/workspaces`);
    return response.json();
};
