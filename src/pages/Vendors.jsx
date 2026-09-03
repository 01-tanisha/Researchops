import { useEffect, useState } from "react";
import {
    getVendors,
    createVendor,
    updateVendor,
    deleteVendor,
} from "../services/api/projectApi";

import DashboardLayout from "../components/layout/DashboardLayout";
import "./Vendors.css";

function Vendors() {
    const [vendors, setVendors] = useState([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");
    const [phone, setPhone] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

useEffect(() => {
    let cancelled = false;

    async function fetchVendors() {
        try {
            const data = await getVendors();

            if (!cancelled) {
                setVendors(Array.isArray(data) ? data : []);
                setError("");
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to load vendors:", error);

            if (!cancelled) {
                setError("Unable to load vendors.");
                setLoading(false);
            }
        }
    }

    fetchVendors();

    return () => {
        cancelled = true;
    };
}, []);

    function resetForm() {
        setName("");
        setEmail("");
        setCompany("");
        setPhone("");
        setEditingId(null);
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!name.trim()) {
            setError("Vendor name is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const vendorData = {
                name: name.trim(),
                email: email.trim(),
                company: company.trim(),
                phone: phone.trim(),
            };

            if (editingId) {
                const updatedVendor = await updateVendor(
                    editingId,
                    vendorData
                );

                setVendors((currentVendors) =>
                    currentVendors.map((vendor) =>
                        vendor.id === editingId
                            ? updatedVendor
                            : vendor
                    )
                );
            } else {
                const newVendor = await createVendor(
                    vendorData
                );

                setVendors((currentVendors) => [
                    newVendor,
                    ...currentVendors,
                ]);
            }

            resetForm();

        } catch (error) {
            console.error("Failed to save vendor:", error);
            setError(error.message || "Unable to save vendor.");
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(vendor) {
        setEditingId(vendor.id);
        setName(vendor.name || "");
        setEmail(vendor.email || "");
        setCompany(vendor.company || "");
        setPhone(vendor.phone || "");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleDelete(vendor) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${vendor.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await deleteVendor(vendor.id);

            setVendors((currentVendors) =>
                currentVendors.filter(
                    (item) => item.id !== vendor.id
                )
            );

            if (editingId === vendor.id) {
                resetForm();
            }

        } catch (error) {
            console.error("Failed to delete vendor:", error);
            setError(error.message || "Unable to delete vendor.");
        }
    }

    return (
        <DashboardLayout>

            <div className="vendors-page">

                <h1 className="vendors-title">
                    Vendors
                </h1>

                <div className="vendor-form-card">

                    <h2>
                        {editingId
                            ? "Edit Vendor"
                            : "Add Vendor"}
                    </h2>

                    {error && (
                        <p className="vendor-error">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="vendor-form-grid">

                            <div>
                                <label>
                                    Vendor Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter vendor name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
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
                                        setEmail(event.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    Company
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter company"
                                    value={company}
                                    onChange={(event) =>
                                        setCompany(event.target.value)
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
                                        setPhone(event.target.value)
                                    }
                                />
                            </div>

                        </div>

                        <div className="vendor-form-actions">

                            <button
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Vendor"
                                        : "Add Vendor"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="vendor-cancel-button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>

                </div>


                <div className="vendors-list-card">

                    <div className="vendors-list-header">
                        <h2>Vendor List</h2>

                        <span>
                            {vendors.length} Vendors
                        </span>
                    </div>

                    {loading && (
                        <p className="vendors-message">
                            Loading vendors...
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        vendors.length === 0 && (
                            <p className="vendors-message">
                                No vendors available.
                            </p>
                        )}

                    {!loading &&
                        vendors.length > 0 && (

                            <div className="vendors-table-wrapper">

                                <table className="vendors-table">

                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Company</th>
                                            <th>Phone</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {vendors.map((vendor) => (

                                            <tr key={vendor.id}>

                                                <td>
                                                    <strong>
                                                        {vendor.name}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {vendor.email ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    {vendor.company ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    {vendor.phone ||
                                                        "—"}
                                                </td>

                                                <td>

                                                    <div className="vendor-actions">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    vendor
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
                                                                    vendor
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                </div>

            </div>

        </DashboardLayout>
    );
}

export default Vendors;