const API_URL = "http://127.0.0.1:8000/api/projects/";
const ACTIVITY_URL = "http://127.0.0.1:8000/api/projects/activity/";
const USERS_URL = "http://127.0.0.1:8000/api/users/";



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



export async function getUsers() {

    const response = await fetch(USERS_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch users.");
    }

    return await response.json();
}

const VENDORS_URL = "http://127.0.0.1:8000/api/vendors/";

export async function getVendors() {
    const response = await fetch(VENDORS_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch vendors.");
    }

    return await response.json();
}

export async function createVendor(vendorData) {
    const response = await fetch(VENDORS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(vendorData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to create vendor."
        );
    }

    return data;
}

export async function updateVendor(id, vendorData) {
    const response = await fetch(
        `${VENDORS_URL}${id}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(vendorData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to update vendor."
        );
    }

    return data;
}

export async function deleteVendor(id) {
    const response = await fetch(
        `${VENDORS_URL}${id}/`,
        {
            method: "DELETE",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to delete vendor."
        );
    }

    return data;
}