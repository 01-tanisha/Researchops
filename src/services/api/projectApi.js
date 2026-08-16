const API_URL = "http://127.0.0.1:8000/api/projects/";
const ACTIVITY_URL = "http://127.0.0.1:8000/api/projects/activity/";


export async function getProjects() {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch projects.");
    }

    return await response.json();
}


export async function createProject(projectData) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(projectData),

    });

    if (!response.ok) {
        throw new Error("Failed to create project.");
    }

    return await response.json();
}


export async function updateProject(id, projectData) {

    const response = await fetch(
        `${API_URL}${id}/`,
        {

            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(projectData),

        }
    );

    if (!response.ok) {
        throw new Error("Failed to update project.");
    }

    return await response.json();
}


export async function deleteProject(id) {

    const response = await fetch(
        `${API_URL}${id}/`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete project.");
    }

    return await response.json();
}


export async function getProjectActivity() {
    const response = await fetch(ACTIVITY_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch project activity.");
    }

    return await response.json();
}