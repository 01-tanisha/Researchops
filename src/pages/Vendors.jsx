import { useEffect, useState } from "react";
import {
    getVendors,
    createVendor,
    updateVendor,
    deleteVendor,
} from "../services/api/projectApi";

import DashboardLayout from "../components/layout/DashboardLayout";
import Modal from "../components/common/Modal";
import "./Vendors.css";

function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");
    const [phone, setPhone] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);


    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const searchQuery = searchTerm.trim().toLowerCase();
    const filteredVendors = vendors.filter((vendor) =>
        [vendor.name, vendor.company, vendor.email, vendor.phone]
            .some((value) => String(value || "").toLowerCase().includes(searchQuery))
    );

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            try {
                const vendorData = await getVendors();

                if (!cancelled) {
                    setVendors(Array.isArray(vendorData) ? vendorData : []);
                    setError("");
                }
            } catch (error) {
                console.error("Failed to load vendor data:", error);

                if (!cancelled) {
                    setError("Unable to load vendors.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchData();

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
        setIsFormOpen(false);
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
                const newVendor = await createVendor(vendorData);

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
        setIsFormOpen(true);
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
                <div className="vendors-page-header">
                    <div>
                        <h1 className="vendors-title">Vendors</h1>
                        <p className="vendors-subtitle">Manage vendor contacts and company details.</p>
                    </div>
                    <button
                        type="button"
                        className="vendor-add-button"
                        onClick={() => {
                            resetForm();
                            setIsFormOpen(true);
                        }}
                    >
                        + Add Vendor
                    </button>
                </div>

                <Modal
                    isOpen={isFormOpen}
                    onClose={resetForm}
                    title={editingId ? "Edit Vendor" : "Add Vendor"}
                >

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
                                        setName(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>Email</label>

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
                                <label>Company</label>

                                <input
                                    type="text"
                                    placeholder="Enter company"
                                    value={company}
                                    onChange={(event) =>
                                        setCompany(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>Phone</label>

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
                </Modal>

                <div className="vendors-list-card">
                    <div className="vendors-list-header">
                        <h2>Vendor List</h2>

                        <div className="directory-list-tools">
                            <label className="directory-search">
                                <span className="visually-hidden">Search vendors</span>
                                <input
                                    type="search"
                                    placeholder="Search vendors..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />
                            </label>
                            <span>
                                {filteredVendors.length === vendors.length
                                    ? `${vendors.length} Vendors`
                                    : `${filteredVendors.length} of ${vendors.length} Vendors`}
                            </span>
                        </div>
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
                        !error &&
                        vendors.length > 0 && filteredVendors.length === 0 && (
                            <p className="vendors-message">No vendors match “{searchTerm}”.</p>
                        )}

                    {!loading &&
                        !error &&
                        filteredVendors.length > 0 && (
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
                                        {filteredVendors.map(
                                            (vendor) => (
                                                <tr
                                                    key={
                                                        vendor.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                vendor.name
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            vendor.email ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            vendor.company ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            vendor.phone ||
                                                            "—"
                                                        }
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

export default Vendors;