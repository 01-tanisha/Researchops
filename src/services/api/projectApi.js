const API_URL = "/api/projects/";
const ACTIVITY_URL = "/api/projects/activity/";
const USERS_URL = "/api/users/";


// ==================== PROJECTS ====================

export async function getProjects() {
    const response = await fetch(API_URL, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch projects.");
    }

    return await response.json();
}

export async function createProject(projectData) {
    const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
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
    const response = await fetch(`${API_URL}${id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
    });

    if (!response.ok) {
        throw new Error("Failed to update project.");
    }

    return await response.json();
}

export async function deleteProject(id) {
    const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to delete project.");
    }

    return await response.json();
}


// ==================== ACTIVITY ====================

export async function getProjectActivity() {
    const response = await fetch(ACTIVITY_URL, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch project activity.");
    }

    return await response.json();
}


// ==================== USERS ====================

export async function getUsers() {
    const response = await fetch(USERS_URL, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch users.");
    }

    return await response.json();
}


// ==================== VENDORS ====================

const VENDORS_URL = "/api/vendors/";

export async function getVendors() {
    const response = await fetch(VENDORS_URL, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch vendors.");
    }

    return await response.json();
}

export async function createVendor(vendorData) {
    const response = await fetch(VENDORS_URL, {
        method: "POST",
        credentials: "include",
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
    const response = await fetch(`${VENDORS_URL}${id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(vendorData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to update vendor."
        );
    }

    return data;
}

export async function deleteVendor(id) {
    const response = await fetch(`${VENDORS_URL}${id}/`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to delete vendor."
        );
    }

    return data;
}


// ==================== VENDOR ALLOCATIONS ====================

const VENDOR_ALLOCATION_URL = "/api/vendor-allocations/";

export async function getVendorAllocations(surveyId) {
    const response = await fetch(
        `/api/surveys/${surveyId}/vendor-allocations/`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to fetch vendor allocations."
        );
    }

    return data;
}

export async function createVendorAllocation(
    surveyId,
    allocationData
) {
    const response = await fetch(
        `/api/surveys/${surveyId}/vendor-allocations/`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(allocationData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to create vendor allocation."
        );
    }

    return data;
}

export async function updateVendorAllocation(
    allocationId,
    allocationData
) {
    const response = await fetch(
        `${VENDOR_ALLOCATION_URL}${allocationId}/`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(allocationData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to update vendor allocation."
        );
    }

    return data;
}

export async function deleteVendorAllocation(allocationId) {
    const response = await fetch(
        `${VENDOR_ALLOCATION_URL}${allocationId}/`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to delete vendor allocation."
        );
    }

    return data;
}


// ==================== CLIENTS ====================

const CLIENTS_URL = "/api/clients/";

export async function getClients() {
    const response = await fetch(CLIENTS_URL, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to fetch clients."
        );
    }

    return data;
}

export async function createClient(clientData) {
    const response = await fetch(CLIENTS_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to create client."
        );
    }

    return data;
}

export async function updateClient(clientId, clientData) {
    const response = await fetch(`${CLIENTS_URL}${clientId}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to update client."
        );
    }

    return data;
}

export async function deleteClient(clientId) {
    const response = await fetch(`${CLIENTS_URL}${clientId}/`, {
        method: "DELETE",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to delete client."
        );
    }

    return data;
}


// ==================== GET PROJECTS FOR CLIENT ====================

export async function getProjectsForClient(clientId) {
    const projects = await getProjects();

    return projects.filter((project) => {
        const projectClientId =
            project.client_id ??
            project.client_obj_id ??
            project.client_obj?.id;

        return String(projectClientId) === String(clientId);
    });
}