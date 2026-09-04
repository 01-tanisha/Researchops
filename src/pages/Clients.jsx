import { useEffect, useState } from "react";
import {
    getClients,
    createClient,
    updateClient,
    deleteClient,
} from "../services/api/projectApi";

import DashboardLayout from "../components/layout/DashboardLayout";
import "./Clients.css";

function Clients() {
    const [clients, setClients] = useState([]);

    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState("Active");

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchClients() {
            try {
                setLoading(true);
                setError("");

                const data = await getClients();

                if (!cancelled) {
                    setClients(
                        Array.isArray(data) ? data : []
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load clients:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.message ||
                            "Unable to load clients."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchClients();

        return () => {
            cancelled = true;
        };
    }, []);

    function resetForm() {
        setName("");
        setCompany("");
        setEmail("");
        setPhone("");
        setNotes("");
        setStatus("Active");
        setEditingId(null);
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!name.trim()) {
            setError("Client name is required.");
            return;
        }

        if (!company.trim()) {
            setError("Company name is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const clientData = {
                name: name.trim(),
                company: company.trim(),
                email: email.trim(),
                phone: phone.trim(),
                notes: notes.trim(),
                status,
            };

            if (editingId) {
                const updatedClient =
                    await updateClient(
                        editingId,
                        clientData
                    );

                setClients((currentClients) =>
                    currentClients.map((client) =>
                        client.id === editingId
                            ? updatedClient
                            : client
                    )
                );
            } else {
                const newClient =
                    await createClient(clientData);

                setClients((currentClients) => [
                    newClient,
                    ...currentClients,
                ]);
            }

            resetForm();
        } catch (error) {
            console.error(
                "Failed to save client:",
                error
            );

            setError(
                error.message ||
                    "Unable to save client."
            );
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(client) {
        setEditingId(client.id);
        setName(client.name || "");
        setCompany(client.company || "");
        setEmail(client.email || "");
        setPhone(client.phone || "");
        setNotes(client.notes || "");
        setStatus(client.status || "Active");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleDelete(client) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${client.company || client.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await deleteClient(client.id);

            setClients((currentClients) =>
                currentClients.filter(
                    (item) => item.id !== client.id
                )
            );

            if (editingId === client.id) {
                resetForm();
            }
        } catch (error) {
            console.error(
                "Failed to delete client:",
                error
            );

            setError(
                error.message ||
                    "Unable to delete client."
            );
        }
    }

    return (
        <DashboardLayout>
            <div className="clients-page">

                <h1 className="clients-title">
                    Clients
                </h1>

                <div className="client-form-card">

                    <h2>
                        {editingId
                            ? "Edit Client"
                            : "Add Client"}
                    </h2>

                    {error && (
                        <p className="client-error">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="client-form-grid">

                            <div>
                                <label>
                                    Client Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter client name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    Company
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter company name"
                                    value={company}
                                    onChange={(event) =>
                                        setCompany(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    Phone
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter phone number"
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>

                            <div className="client-notes-field">
                                <label>
                                    Notes
                                </label>

                                <textarea
                                    rows="3"
                                    placeholder="Add client notes"
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                        </div>

                        <div className="client-form-actions">

                            <button
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                      ? "Update Client"
                                      : "Add Client"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="client-cancel-button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>
                </div>

                <div className="clients-list-card">

                    <div className="clients-list-header">
                        <h2>
                            Client List
                        </h2>

                        <span>
                            {clients.length} Clients
                        </span>
                    </div>

                    {loading && (
                        <p className="clients-message">
                            Loading clients...
                        </p>
                    )}

                    {!loading &&
                        clients.length === 0 && (
                            <p className="clients-message">
                                No clients available.
                            </p>
                        )}

                    {!loading &&
                        clients.length > 0 && (
                            <div className="clients-table-wrapper">

                                <table className="clients-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Name
                                            </th>

                                            <th>
                                                Company
                                            </th>

                                            <th>
                                                Email
                                            </th>

                                            <th>
                                                Phone
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {clients.map(
                                            (client) => (
                                                <tr
                                                    key={
                                                        client.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                client.name
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            client.company ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            client.email ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            client.phone ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`client-status ${String(
                                                                client.status ||
                                                                    ""
                                                            ).toLowerCase()}`}
                                                        >
                                                            {
                                                                client.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="client-actions">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        client
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="delete-button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        client
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                </div>

            </div>
        </DashboardLayout>
    );
}

export default Clients;