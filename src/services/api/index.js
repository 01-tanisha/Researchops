const USERS_API_URL = "http://127.0.0.1:8000/api";

export async function getUsers() {
  const response = await fetch(`${USERS_API_URL}/users/`);

  if (!response.ok) {
    throw new Error("Failed to fetch users.");
  }

  return await response.json();
}

export {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "./projectApi";