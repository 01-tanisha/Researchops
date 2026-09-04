import { useEffect, useState } from "react";
import {
    getVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    getVendorAllocations,
    createVendorAllocation,
    updateVendorAllocation,
    deleteVendorAllocation,
} from "../services/api/projectApi";
import { getSurveys } from "../services/api/surveyApi";

import DashboardLayout from "../components/layout/DashboardLayout";
import "./Vendors.css";

function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [surveys, setSurveys] = useState([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");
    const [phone, setPhone] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [selectedVendor, setSelectedVendor] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [showAllocations, setShowAllocations] = useState(false);

    const [allocationSurvey, setAllocationSurvey] = useState("");
    const [assignedCompletes, setAssignedCompletes] = useState("");
    const [deliveredCompletes, setDeliveredCompletes] = useState("");
    const [validCompletes, setValidCompletes] = useState("");
    const [vendorCpi, setVendorCpi] = useState("");
    const [feasibility, setFeasibility] = useState("");
    const [allocationStatus, setAllocationStatus] = useState("Pending");
    const [allocationNotes, setAllocationNotes] = useState("");
    const [editingAllocationId, setEditingAllocationId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allocationLoading, setAllocationLoading] = useState(false);
    const [allocationSaving, setAllocationSaving] = useState(false);

    const [error, setError] = useState("");
    const [allocationError, setAllocationError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            try {
                const [vendorData, surveyData] = await Promise.all([
                    getVendors(),
                    getSurveys(),
                ]);

                if (!cancelled) {
                    setVendors(Array.isArray(vendorData) ? vendorData : []);
                    setSurveys(Array.isArray(surveyData) ? surveyData : []);
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

            if (selectedVendor?.id === vendor.id) {
                closeAllocations();
            }

            if (editingId === vendor.id) {
                resetForm();
            }
        } catch (error) {
            console.error("Failed to delete vendor:", error);
            setError(error.message || "Unable to delete vendor.");
        }
    }

    function resetAllocationForm() {
        setAllocationSurvey("");
        setAssignedCompletes("");
        setDeliveredCompletes("");
        setValidCompletes("");
        setVendorCpi("");
        setFeasibility("");
        setAllocationStatus("Pending");
        setAllocationNotes("");
        setEditingAllocationId(null);
        setAllocationError("");
    }

    async function openAllocations(vendor) {
        try {
            setSelectedVendor(vendor);
            setShowAllocations(true);
            setAllocationLoading(true);
            setAllocationError("");
            resetAllocationForm();

            const allAllocations = [];

            for (const survey of surveys) {
                try {
                    const data = await getVendorAllocations(survey.id);

                    if (Array.isArray(data)) {
                        data.forEach((allocation) => {
                            if (allocation.vendor_id === vendor.id) {
                                allAllocations.push({
                                    ...allocation,
                                    survey_title:
                                        allocation.survey_title ||
                                        survey.title,
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error(
                        `Failed to load allocations for survey ${survey.id}:`,
                        error
                    );
                }
            }

            setAllocations(allAllocations);
        } catch (error) {
            console.error("Failed to load allocations:", error);
            setAllocationError(
                error.message || "Unable to load allocations."
            );
        } finally {
            setAllocationLoading(false);
        }
    }

    function closeAllocations() {
        setShowAllocations(false);
        setSelectedVendor(null);
        setAllocations([]);
        resetAllocationForm();
    }

    async function handleAllocationSubmit(event) {
        event.preventDefault();

        if (!selectedVendor) {
            return;
        }

        if (!allocationSurvey) {
            setAllocationError("Please select a survey.");
            return;
        }

        if (assignedCompletes === "") {
            setAllocationError("Assigned completes are required.");
            return;
        }

        try {
            setAllocationSaving(true);
            setAllocationError("");

            const allocationData = {
                vendor_id: selectedVendor.id,
                assigned_completes: Number(assignedCompletes),
                delivered_completes:
                    deliveredCompletes === ""
                        ? 0
                        : Number(deliveredCompletes),
                valid_completes:
                    validCompletes === ""
                        ? 0
                        : Number(validCompletes),
                vendor_cpi:
                    vendorCpi === "" ? 0 : Number(vendorCpi),
                feasibility:
                    feasibility === "" ? 0 : Number(feasibility),
                status: allocationStatus,
                notes: allocationNotes.trim(),
            };

            if (editingAllocationId) {
                const updatedAllocation =
                    await updateVendorAllocation(
                        editingAllocationId,
                        allocationData
                    );

                setAllocations((current) =>
                    current.map((allocation) =>
                        allocation.id === editingAllocationId
                            ? {
                                  ...updatedAllocation,
                                  survey_title:
                                      allocation.survey_title,
                              }
                            : allocation
                    )
                );
            } else {
                const newAllocation =
                    await createVendorAllocation(
                        Number(allocationSurvey),
                        allocationData
                    );

                const selectedSurvey = surveys.find(
                    (survey) =>
                        survey.id === Number(allocationSurvey)
                );

                setAllocations((current) => [
                    {
                        ...newAllocation,
                        survey_title:
                            newAllocation.survey_title ||
                            selectedSurvey?.title ||
                            "Survey",
                    },
                    ...current,
                ]);
            }

            resetAllocationForm();
        } catch (error) {
            console.error(
                "Failed to save allocation:",
                error
            );

            setAllocationError(
                error.message ||
                    "Unable to save vendor allocation."
            );
        } finally {
            setAllocationSaving(false);
        }
    }

    function handleEditAllocation(allocation) {
        setEditingAllocationId(allocation.id);

        setAllocationSurvey(
            allocation.survey_id
                ? String(allocation.survey_id)
                : ""
        );

        setAssignedCompletes(
            allocation.assigned_completes ?? ""
        );

        setDeliveredCompletes(
            allocation.delivered_completes ?? ""
        );

        setValidCompletes(
            allocation.valid_completes ?? ""
        );

        setVendorCpi(
            allocation.vendor_cpi ?? ""
        );

        setFeasibility(
            allocation.feasibility ?? ""
        );

        setAllocationStatus(
            allocation.status || "Pending"
        );

        setAllocationNotes(
            allocation.notes || ""
        );

        setAllocationError("");
    }

    async function handleDeleteAllocation(allocation) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this allocation?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setAllocationError("");

            await deleteVendorAllocation(allocation.id);

            setAllocations((current) =>
                current.filter(
                    (item) => item.id !== allocation.id
                )
            );

            if (
                editingAllocationId === allocation.id
            ) {
                resetAllocationForm();
            }
        } catch (error) {
            console.error(
                "Failed to delete allocation:",
                error
            );

            setAllocationError(
                error.message ||
                    "Unable to delete allocation."
            );
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
                                        {vendors.map(
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
                                                                    openAllocations(
                                                                        vendor
                                                                    )
                                                                }
                                                            >
                                                                Allocations
                                                            </button>

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

                {showAllocations && selectedVendor && (
                    <div className="allocation-modal-overlay">
                        <div className="allocation-modal">
                            <div className="allocation-modal-header">
                                <div>
                                    <h2>
                                        Vendor Allocations
                                    </h2>

                                    <p>
                                        {
                                            selectedVendor.company ||
                                            selectedVendor.name
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="allocation-close-button"
                                    onClick={
                                        closeAllocations
                                    }
                                >
                                    ×
                                </button>
                            </div>

                            {allocationError && (
                                <p className="vendor-error">
                                    {allocationError}
                                </p>
                            )}

                            <form
                                className="allocation-form"
                                onSubmit={
                                    handleAllocationSubmit
                                }
                            >
                                <h3>
                                    {editingAllocationId
                                        ? "Edit Allocation"
                                        : "Add Allocation"}
                                </h3>

                                <div className="allocation-form-grid">
                                    <div>
                                        <label>
                                            Survey
                                        </label>

                                        <select
                                            value={
                                                allocationSurvey
                                            }
                                            onChange={(event) =>
                                                setAllocationSurvey(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                !!editingAllocationId
                                            }
                                        >
                                            <option value="">
                                                Select survey
                                            </option>

                                            {surveys.map(
                                                (survey) => (
                                                    <option
                                                        key={
                                                            survey.id
                                                        }
                                                        value={
                                                            survey.id
                                                        }
                                                    >
                                                        {
                                                            survey.title
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label>
                                            Assigned Completes
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                assignedCompletes
                                            }
                                            onChange={(event) =>
                                                setAssignedCompletes(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label>
                                            Delivered Completes
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                deliveredCompletes
                                            }
                                            onChange={(event) =>
                                                setDeliveredCompletes(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label>
                                            Valid Completes
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                validCompletes
                                            }
                                            onChange={(event) =>
                                                setValidCompletes(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label>
                                            Vendor CPI
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={vendorCpi}
                                            onChange={(event) =>
                                                setVendorCpi(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label>
                                            Feasibility
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={feasibility}
                                            onChange={(event) =>
                                                setFeasibility(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label>Status</label>

                                        <select
                                            value={
                                                allocationStatus
                                            }
                                            onChange={(event) =>
                                                setAllocationStatus(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        >
                                            <option value="Pending">
                                                Pending
                                            </option>
                                            <option value="Active">
                                                Active
                                            </option>
                                            <option value="Quota Full">
                                                Quota Full
                                            </option>
                                            <option value="Completed">
                                                Completed
                                            </option>
                                            <option value="Paused">
                                                Paused
                                            </option>
                                        </select>
                                    </div>

                                    <div className="allocation-notes">
                                        <label>Notes</label>

                                        <textarea
                                            rows="3"
                                            placeholder="Add notes"
                                            value={
                                                allocationNotes
                                            }
                                            onChange={(event) =>
                                                setAllocationNotes(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="allocation-form-actions">
                                    <button
                                        type="submit"
                                        disabled={
                                            allocationSaving
                                        }
                                    >
                                        {allocationSaving
                                            ? "Saving..."
                                            : editingAllocationId
                                              ? "Update Allocation"
                                              : "Add Allocation"}
                                    </button>

                                    {editingAllocationId && (
                                        <button
                                            type="button"
                                            className="vendor-cancel-button"
                                            onClick={
                                                resetAllocationForm
                                            }
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="allocations-list">
                                <h3>
                                    Current Allocations
                                </h3>

                                {allocationLoading ? (
                                    <p className="vendors-message">
                                        Loading allocations...
                                    </p>
                                ) : allocations.length ===
                                  0 ? (
                                    <p className="vendors-message">
                                        No allocations found for
                                        this vendor.
                                    </p>
                                ) : (
                                    <div className="vendors-table-wrapper">
                                        <table className="vendors-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Survey
                                                    </th>
                                                    <th>
                                                        Assigned
                                                    </th>
                                                    <th>
                                                        Delivered
                                                    </th>
                                                    <th>
                                                        Valid
                                                    </th>
                                                    <th>
                                                        Remaining
                                                    </th>
                                                    <th>
                                                        CPI
                                                    </th>
                                                    <th>
                                                        Feasibility
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
                                                {allocations.map(
                                                    (
                                                        allocation
                                                    ) => (
                                                        <tr
                                                            key={
                                                                allocation.id
                                                            }
                                                        >
                                                            <td>
                                                                {
                                                                    allocation.survey_title
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    allocation.assigned_completes
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    allocation.delivered_completes
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    allocation.valid_completes
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    allocation.remaining_completes ??
                                                                    Math.max(
                                                                        Number(
                                                                            allocation.assigned_completes ||
                                                                                0
                                                                        ) -
                                                                            Number(
                                                                                allocation.delivered_completes ||
                                                                                    0
                                                                            ),
                                                                        0
                                                                    )
                                                                }
                                                            </td>

                                                            <td>
                                                                ₹
                                                                {Number(
                                                                    allocation.vendor_cpi ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "en-IN",
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                    }
                                                                )}
                                                            </td>

                                                            <td>
                                                                {
                                                                    allocation.feasibility
                                                                }
                                                            </td>

                                                            <td>
                                                                {
                                                                    allocation.status
                                                                }
                                                            </td>

                                                            <td>
                                                                <div className="vendor-actions">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleEditAllocation(
                                                                                allocation
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="delete-button"
                                                                        onClick={() =>
                                                                            handleDeleteAllocation(
                                                                                allocation
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
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Vendors;