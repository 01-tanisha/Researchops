import { useEffect, useState } from "react";
import "./SurveyDetails.css";

import EditQuestion from "./EditQuestion";
import AddQuestion from "./AddQuestion";
import AddScreeningQuestion from "./AddScreeningQuestion";

import {
    getSurveyQuestions,
    getScreeningQuestions,
    getSurveyBilling,
    updateSurveyStatus,
} from "../../services/api/surveyApi";

import {
    getVendors,
    getVendorAllocations,
    createVendorAllocation,
    updateVendorAllocation,
    deleteVendorAllocation,
} from "../../services/api/projectApi";

function SurveyDetails({ survey, onClose, onSurveyUpdated }) {
    // ==================== QUESTIONS ====================

    const [questions, setQuestions] = useState([]);
    const [screeningQuestions, setScreeningQuestions] = useState([]);

    const [editingQuestion, setEditingQuestion] = useState(null);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [showAddScreening, setShowAddScreening] = useState(false);

    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [isLoadingScreening, setIsLoadingScreening] = useState(false);

    const [questionError, setQuestionError] = useState("");
    const [screeningError, setScreeningError] = useState("");

    // ==================== PUBLIC LINK ====================

    const [linkCopied, setLinkCopied] = useState(false);

    // ==================== VENDOR ALLOCATION ====================

    const [vendors, setVendors] = useState([]);
    const [allocations, setAllocations] = useState([]);

    const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);
    const [allocationError, setAllocationError] = useState("");

    const [showAllocationForm, setShowAllocationForm] = useState(false);
    const [editingAllocation, setEditingAllocation] = useState(null);

    const [allocationForm, setAllocationForm] = useState({
        vendor_id: "",
        assigned_completes: "",
        delivered_completes: "",
        valid_completes: "",
        vendor_cpi: "",
        feasibility: "",
        status: "Pending",
        notes: "",
    });

    const [isSavingAllocation, setIsSavingAllocation] = useState(false);

    // ==================== SURVEY STATUS ====================

    const [currentStatus, setCurrentStatus] = useState(
        survey?.status || "Draft"
    );

    const [statusLoading, setStatusLoading] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const [billing, setBilling] = useState(null);
    const [billingError, setBillingError] = useState("");

    // Keep status synchronized when a different survey is opened
    useEffect(() => {
        setCurrentStatus(survey?.status || "Draft");
        setStatusError("");
        setStatusMessage("");
    }, [survey?.id, survey?.status]);

    // ==================== FETCH MAIN QUESTIONS ====================

    useEffect(() => {
        if (!survey?.id) return;

        async function fetchQuestions() {
            try {
                setIsLoadingQuestions(true);
                setQuestionError("");

                const data = await getSurveyQuestions(survey.id);

                setQuestions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(
                    "Failed to load survey questions:",
                    error
                );

                setQuestionError(
                    error.message || "Unable to load survey questions."
                );
            } finally {
                setIsLoadingQuestions(false);
            }
        }

        fetchQuestions();
    }, [survey?.id]);

    // ==================== FETCH SCREENING QUESTIONS ====================

    useEffect(() => {
        if (!survey?.id) return;

        async function fetchScreeningQuestions() {
            try {
                setIsLoadingScreening(true);
                setScreeningError("");

                const data = await getScreeningQuestions(survey.id);

                setScreeningQuestions(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error(
                    "Failed to load screening questions:",
                    error
                );

                setScreeningError(
                    error.message ||
                        "Unable to load screening questions."
                );
            } finally {
                setIsLoadingScreening(false);
            }
        }

        fetchScreeningQuestions();
    }, [survey?.id]);

    // ==================== FETCH VENDORS + ALLOCATIONS ====================

    useEffect(() => {
        if (!survey?.id) return;

        async function fetchVendorData() {
            try {
                setIsLoadingAllocations(true);
                setAllocationError("");

                const [vendorsData, allocationsData] =
                    await Promise.all([
                        getVendors(),
                        getVendorAllocations(survey.id),
                    ]);

                setVendors(
                    Array.isArray(vendorsData)
                        ? vendorsData
                        : []
                );

                setAllocations(
                    Array.isArray(allocationsData)
                        ? allocationsData
                        : []
                );
            } catch (error) {
                console.error(
                    "Failed to load vendor allocations:",
                    error
                );

                setAllocationError(
                    error.message ||
                        "Unable to load vendor allocations."
                );
            } finally {
                setIsLoadingAllocations(false);
            }
        }

        fetchVendorData();
    }, [survey?.id]);

    useEffect(() => {
        if (!survey?.id) return;

        async function fetchBilling() {
            try {
                setBillingError("");
                const data = await getSurveyBilling(survey.id);
                setBilling(data);
            } catch (error) {
                console.error("Failed to load survey billing:", error);
                setBilling(null);
                setBillingError(
                    error.message || "Unable to load billing details."
                );
            }
        }

        fetchBilling();
    }, [survey?.id, currentStatus, allocations]);

    // ==================== LINK COPIED TIMEOUT ====================

    useEffect(() => {
        if (!linkCopied) return;

        const timeoutId = setTimeout(() => {
            setLinkCopied(false);
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [linkCopied]);

    // ==================== SURVEY CALCULATIONS ====================

    const requiredCompletes = Number(
        survey?.required_completes ?? 0
    );

    const clientCpi = Number(
        survey?.client_cpi ?? 0
    );

    const totalAssigned = allocations.reduce(
        (total, allocation) =>
            total +
            Number(allocation.assigned_completes ?? 0),
        0
    );

    const totalDelivered = allocations.reduce(
        (total, allocation) =>
            total +
            Number(allocation.delivered_completes ?? 0),
        0
    );

    const totalValid = allocations.reduce(
        (total, allocation) =>
            total +
            Number(allocation.valid_completes ?? 0),
        0
    );

    const remainingCompletes = Math.max(
        requiredCompletes - totalValid,
        0
    );

    const progressPercentage =
        requiredCompletes > 0
            ? Math.min(
                  (totalValid / requiredCompletes) * 100,
                  100
              )
            : 0;

    const clientRevenue = totalValid * clientCpi;

    const vendorCost = allocations.reduce(
        (total, allocation) => {
            const valid = Number(
                allocation.valid_completes ?? 0
            );

            const cpi = Number(
                allocation.vendor_cpi ?? 0
            );

            return total + valid * cpi;
        },
        0
    );

    const estimatedMargin = clientRevenue - vendorCost;

    // ==================== UPDATE SURVEY STATUS ====================

    const handleStatusChange = async (newStatus) => {
        if (!survey?.id || statusLoading) return;

        // Completed validation
        if (newStatus === "Completed") {
            if (
                requiredCompletes > 0 &&
                totalValid < requiredCompletes
            ) {
                setStatusError(
                    `Cannot complete survey. Required completes: ${requiredCompletes}, valid completes: ${totalValid}.`
                );
                setStatusMessage("");
                return;
            }

            if (currentStatus === "Billed") {
                setStatusError(
                    "A billed survey cannot be changed to Completed."
                );
                setStatusMessage("");
                return;
            }
        }

        // Billed validation
        if (
            newStatus === "Billed" &&
            currentStatus !== "Completed"
        ) {
            setStatusError(
                "Survey must be Completed before it can be Billed."
            );
            setStatusMessage("");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to mark this survey as ${newStatus}?`
        );

        if (!confirmed) return;

        try {
            setStatusLoading(true);
            setStatusError("");
            setStatusMessage("");

            const updatedSurvey = await updateSurveyStatus(
                survey.id,
                newStatus
            );

            const updatedStatus =
                updatedSurvey?.status || newStatus;

            setCurrentStatus(updatedStatus);

            setStatusMessage(
                updatedSurvey?.message ||
                    `Survey marked as ${updatedStatus}.`
            );

            // Update parent survey list
            if (onSurveyUpdated) {
                onSurveyUpdated({
                    ...survey,
                    ...updatedSurvey,
                    status: updatedStatus,
                });
            }
        } catch (error) {
            console.error(
                "Failed to update survey status:",
                error
            );

            setStatusError(
                error.message ||
                    "Failed to update survey status."
            );
        } finally {
            setStatusLoading(false);
        }
    };

    // ==================== COPY PUBLIC LINK ====================

    const handleCopyPublicLink = async () => {
        if (!survey?.public_token) {
            alert("Public survey link is not available.");
            return;
        }

        const publicLink =
            `${window.location.origin}/survey/${survey.public_token}`;

        try {
            await navigator.clipboard.writeText(publicLink);
            setLinkCopied(true);
        } catch (error) {
            console.error(
                "Failed to copy survey link:",
                error
            );

            alert("Unable to copy the survey link.");
        }
    };

    // ==================== ALLOCATION FORM ====================

    const resetAllocationForm = () => {
        setAllocationForm({
            vendor_id: "",
            assigned_completes: "",
            delivered_completes: "",
            valid_completes: "",
            vendor_cpi: "",
            feasibility: "",
            status: "Pending",
            notes: "",
        });

        setEditingAllocation(null);
        setAllocationError("");
    };

    const handleAllocationInput = (event) => {
        const { name, value } = event.target;

        setAllocationForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setAllocationError("");
    };

    const handleOpenAddAllocation = () => {
        resetAllocationForm();
        setShowAllocationForm(true);
    };

    const handleOpenEditAllocation = (allocation) => {
        setEditingAllocation(allocation);

        setAllocationForm({
            vendor_id:
                allocation.vendor_id ??
                allocation.vendor?.id ??
                "",

            assigned_completes:
                allocation.assigned_completes ?? "",

            delivered_completes:
                allocation.delivered_completes ?? "",

            valid_completes:
                allocation.valid_completes ?? "",

            vendor_cpi:
                allocation.vendor_cpi ?? "",

            feasibility:
                allocation.feasibility ?? "",

            status:
                allocation.status ?? "Pending",

            notes:
                allocation.notes ?? "",
        });

        setAllocationError("");
        setShowAllocationForm(true);
    };

    const handleCancelAllocation = () => {
        setShowAllocationForm(false);
        resetAllocationForm();
    };

    // ==================== SAVE ALLOCATION ====================

    const handleSaveAllocation = async (event) => {
        event.preventDefault();

        const vendorId = Number(
            allocationForm.vendor_id
        );

        const assigned = Number(
            allocationForm.assigned_completes || 0
        );

        const delivered = Number(
            allocationForm.delivered_completes || 0
        );

        const valid = Number(
            allocationForm.valid_completes || 0
        );

        const vendorCpi = Number(
            allocationForm.vendor_cpi || 0
        );

        const feasibility = Number(
            allocationForm.feasibility || 0
        );

        // ---------- VALIDATION ----------

        if (!vendorId) {
            setAllocationError(
                "Please select a vendor."
            );
            return;
        }

        if (assigned < 0) {
            setAllocationError(
                "Assigned completes cannot be negative."
            );
            return;
        }

        if (delivered < 0) {
            setAllocationError(
                "Delivered completes cannot be negative."
            );
            return;
        }

        if (valid < 0) {
            setAllocationError(
                "Valid completes cannot be negative."
            );
            return;
        }

        if (delivered > assigned) {
            setAllocationError(
                "Delivered completes cannot be greater than assigned completes."
            );
            return;
        }

        if (valid > delivered) {
            setAllocationError(
                "Valid completes cannot be greater than delivered completes."
            );
            return;
        }

        if (vendorCpi < 0) {
            setAllocationError(
                "Vendor CPI cannot be negative."
            );
            return;
        }

        if (feasibility < 0) {
            setAllocationError(
                "Feasibility cannot be negative."
            );
            return;
        }

        try {
            setIsSavingAllocation(true);
            setAllocationError("");

            const payload = {
                vendor_id: vendorId,
                assigned_completes: assigned,
                delivered_completes: delivered,
                valid_completes: valid,
                vendor_cpi: vendorCpi,
                feasibility: feasibility,
                status: allocationForm.status,
                notes: allocationForm.notes.trim(),
            };

            if (editingAllocation) {
                const updatedAllocation =
                    await updateVendorAllocation(
                        editingAllocation.id,
                        payload
                    );

                setAllocations((previous) =>
                    previous.map((allocation) =>
                        allocation.id ===
                        editingAllocation.id
                            ? {
                                  ...allocation,
                                  ...updatedAllocation,
                                  vendor_id:
                                      updatedAllocation.vendor_id ??
                                      vendorId,
                              }
                            : allocation
                    )
                );
            } else {
                const newAllocation =
                    await createVendorAllocation(
                        survey.id,
                        payload
                    );

                setAllocations((previous) => [
                    ...previous,
                    newAllocation,
                ]);
            }

            setShowAllocationForm(false);
            resetAllocationForm();
        } catch (error) {
            console.error(
                "Failed to save vendor allocation:",
                error
            );

            setAllocationError(
                error.message ||
                    "Failed to save vendor allocation."
            );
        } finally {
            setIsSavingAllocation(false);
        }
    };

    // ==================== DELETE ALLOCATION ====================

    const handleDeleteAllocation = async (allocation) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this vendor allocation?"
        );

        if (!confirmed) return;

        try {
            setAllocationError("");

            await deleteVendorAllocation(
                allocation.id
            );

            setAllocations((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== allocation.id
                )
            );
        } catch (error) {
            console.error(
                "Failed to delete allocation:",
                error
            );

            setAllocationError(
                error.message ||
                    "Failed to delete vendor allocation."
            );
        }
    };

    if (!survey) return null;

    return (
        <div className="survey-details">

            {/* ==================== HEADER ==================== */}

            <div className="survey-details-header">
                <h2>Survey Details</h2>
            </div>

            {/* ==================== SURVEY INFORMATION ==================== */}

            <div className="survey-details-content">

                <div className="survey-detail-item">
                    <span>Survey Name</span>
                    <strong>{survey.title}</strong>
                </div>

                <div className="survey-detail-item">
                    <span>Client Name</span>
                    <strong>{survey.client}</strong>
                </div>

                <div className="survey-detail-item">
                    <span>Status</span>
                    <strong className="survey-current-status">
                        {currentStatus}
                    </strong>
                </div>

                <div className="survey-detail-item">
                    <span>Survey ID</span>
                    <strong>{survey.id}</strong>
                </div>

            </div>

            {/* ==================== SURVEY STATUS ==================== */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">
                    <h3>Survey Status</h3>
                </div>

                <div className="survey-status-actions">

                    {currentStatus !== "Completed" &&
                        currentStatus !== "Billed" && (
                            <button
                                type="button"
                                className="complete-survey-btn"
                                onClick={() =>
                                    handleStatusChange(
                                        "Completed"
                                    )
                                }
                                disabled={statusLoading}
                            >
                                {statusLoading
                                    ? "Updating..."
                                    : "✓ Mark Completed"}
                            </button>
                        )}

                    {currentStatus === "Completed" && (
                        <button
                            type="button"
                            className="bill-survey-btn"
                            onClick={() =>
                                handleStatusChange(
                                    "Billed"
                                )
                            }
                            disabled={statusLoading}
                        >
                            {statusLoading
                                ? "Updating..."
                                : "₹ Mark Billed"}
                        </button>
                    )}

                    {currentStatus === "Billed" && (
                        <span className="survey-billed-message">
                            ✓ Survey has been billed
                        </span>
                    )}

                </div>

                {statusError && (
                    <p className="questions-error">
                        {statusError}
                    </p>
                )}

                {statusMessage && (
                    <p className="questions-message">
                        {statusMessage}
                    </p>
                )}

            </div>

            {/* ==================== SURVEY REQUIREMENTS ==================== */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">
                    <h3>Survey Requirements</h3>
                </div>

                <div className="survey-requirements-grid">

                    <div className="requirement-card">
                        <span>Targeting</span>
                        <strong>
                            {survey.targeting ||
                                "Not specified"}
                        </strong>
                    </div>

                    <div className="requirement-card">
                        <span>Incidence Rate</span>
                        <strong>
                            {survey.incidence_rate != null
                                ? `${survey.incidence_rate}%`
                                : "Not specified"}
                        </strong>
                    </div>

                    <div className="requirement-card">
                        <span>LOI</span>
                        <strong>
                            {survey.loi != null
                                ? `${survey.loi} min`
                                : "Not specified"}
                        </strong>
                    </div>

                    <div className="requirement-card">
                        <span>Required Completes</span>
                        <strong>
                            {requiredCompletes}
                        </strong>
                    </div>

                    <div className="requirement-card">
                        <span>Client CPI</span>
                        <strong>
                            ₹
                            {clientCpi.toLocaleString(
                                "en-IN",
                                {
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                </div>

            </div>

            {/* ==================== SURVEY PROGRESS ==================== */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">
                    <h3>Survey Progress</h3>
                </div>

                <div className="survey-progress-grid">

                    <div className="progress-stat-card">
                        <span>Required</span>
                        <strong>{requiredCompletes}</strong>
                    </div>

                    <div className="progress-stat-card">
                        <span>Assigned</span>
                        <strong>{totalAssigned}</strong>
                    </div>

                    <div className="progress-stat-card">
                        <span>Delivered</span>
                        <strong>{totalDelivered}</strong>
                    </div>

                    <div className="progress-stat-card">
                        <span>Valid</span>
                        <strong>{totalValid}</strong>
                    </div>

                    <div className="progress-stat-card">
                        <span>Remaining</span>
                        <strong>{remainingCompletes}</strong>
                    </div>

                </div>

                <div className="survey-progress-container">

                    <div className="survey-progress-header">
                        <span>Completion Progress</span>

                        <strong>
                            {progressPercentage.toFixed(1)}%
                        </strong>
                    </div>

                    <div className="survey-progress-bar">
                        <div
                            className="survey-progress-fill"
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        />
                    </div>

                </div>

            </div>

            {/* ==================== FINANCIAL SUMMARY ==================== */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">
                    <h3>Financial Summary</h3>
                </div>

                <div className="survey-financial-grid">

                    <div className="financial-card">
                        <span>Client Revenue</span>

                        <strong>
                            ₹
                            {clientRevenue.toLocaleString(
                                "en-IN",
                                {
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                    <div className="financial-card">
                        <span>Vendor Cost</span>

                        <strong>
                            ₹
                            {vendorCost.toLocaleString(
                                "en-IN",
                                {
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                    <div className="financial-card">
                        <span>Estimated Margin</span>

                        <strong>
                            ₹
                            {estimatedMargin.toLocaleString(
                                "en-IN",
                                {
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                    </div>

                </div>

            </div>

            {/* ==================== BILLING SUMMARY ==================== */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">
                    <h3>Billing Summary</h3>
                </div>

                {billingError && (
                    <p className="questions-error">{billingError}</p>
                )}

                {!billingError && billing && (
                    <div className="survey-progress-grid">
                        <div className="progress-stat-card">
                            <span>Client Revenue</span>
                            <strong>₹{Number(billing.client_revenue || 0).toLocaleString("en-IN")}</strong>
                        </div>
                        <div className="progress-stat-card">
                            <span>Vendor Cost</span>
                            <strong>₹{Number(billing.vendor_cost || 0).toLocaleString("en-IN")}</strong>
                        </div>
                        <div className="progress-stat-card">
                            <span>Profit</span>
                            <strong>₹{Number(billing.profit || 0).toLocaleString("en-IN")}</strong>
                        </div>
                        <div className="progress-stat-card">
                            <span>Completion</span>
                            <strong>{Number(billing.completion_percentage || 0).toFixed(1)}%</strong>
                        </div>
                    </div>
                )}

            </div>

            {/* ==================== VENDOR ALLOCATIONS ==================== */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">

                    <h3>Vendor Allocations</h3>

                    <button
                        type="button"
                        className="add-screening-btn"
                        onClick={handleOpenAddAllocation}
                    >
                        + Add Vendor Allocation
                    </button>

                </div>

                {allocationError && (
                    <p className="questions-error">
                        {allocationError}
                    </p>
                )}

                {isLoadingAllocations && (
                    <p className="questions-message">
                        Loading vendor allocations...
                    </p>
                )}

                {!isLoadingAllocations &&
                    !allocationError &&
                    allocations.length === 0 && (
                        <p className="questions-message">
                            No vendors allocated to this survey yet.
                        </p>
                    )}

                {!isLoadingAllocations &&
                    allocations.length > 0 && (
                        <div className="vendor-allocation-list">

                            {allocations.map(
                                (allocation) => {

                                    const vendor =
                                        vendors.find(
                                            (item) =>
                                                String(item.id) ===
                                                String(
                                                    allocation.vendor_id
                                                )
                                        );

                                    const remaining =
                                        Math.max(
                                            Number(
                                                allocation.assigned_completes ??
                                                    0
                                            ) -
                                                Number(
                                                    allocation.delivered_completes ??
                                                        0
                                                ),
                                            0
                                        );

                                    return (
                                        <div
                                            className="vendor-allocation-card"
                                            key={allocation.id}
                                        >

                                            <div className="allocation-header">

                                                <strong>
                                                    {allocation.vendor_name ||
                                                        vendor?.company ||
                                                        vendor?.name ||
                                                        "Unknown Vendor"}
                                                </strong>

                                                <span>
                                                    {allocation.status}
                                                </span>

                                            </div>

                                            <div className="allocation-stats">

                                                <div>
                                                    <span>Assigned</span>
                                                    <strong>
                                                        {allocation.assigned_completes ??
                                                            0}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Delivered</span>
                                                    <strong>
                                                        {allocation.delivered_completes ??
                                                            0}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Valid</span>
                                                    <strong>
                                                        {allocation.valid_completes ??
                                                            0}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Remaining</span>
                                                    <strong>
                                                        {allocation.remaining_completes ??
                                                            remaining}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Vendor CPI</span>
                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            allocation.vendor_cpi ??
                                                                0
                                                        ).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                maximumFractionDigits: 2,
                                                            }
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Feasibility</span>
                                                    <strong>
                                                        {allocation.feasibility ??
                                                            0}
                                                    </strong>
                                                </div>

                                            </div>

                                            {allocation.notes && (
                                                <p className="allocation-notes">
                                                    <strong>
                                                        Notes:
                                                    </strong>{" "}
                                                    {allocation.notes}
                                                </p>
                                            )}

                                            <div className="allocation-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenEditAllocation(
                                                            allocation
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteAllocation(
                                                            allocation
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

            </div>

            {/* ==================== SCREENING QUESTIONS ==================== */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">

                    <h3>Screening Questions</h3>

                    <button
                        type="button"
                        className="add-screening-btn"
                        onClick={() =>
                            setShowAddScreening(true)
                        }
                    >
                        + Add Screening Question
                    </button>

                </div>

                {isLoadingScreening && (
                    <p className="questions-message">
                        Loading screening questions...
                    </p>
                )}

                {!isLoadingScreening &&
                    screeningError && (
                        <p className="questions-error">
                            {screeningError}
                        </p>
                    )}

                {!isLoadingScreening &&
                    !screeningError &&
                    screeningQuestions.length === 0 && (
                        <p className="questions-message">
                            No screening questions added yet.
                        </p>
                    )}

                {!isLoadingScreening &&
                    !screeningError &&
                    screeningQuestions.length > 0 && (
                        <div className="questions-list">

                            {screeningQuestions.map(
                                (question, index) => (
                                    <div
                                        className="survey-question-card"
                                        key={question.id}
                                    >

                                        <div className="question-number">
                                            <span>
                                                Screening Question{" "}
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="question-text">
                                            <strong>
                                                {question.question_text}
                                            </strong>
                                        </div>

                                        <div className="question-meta">

                                            <span>
                                                Type:{" "}
                                                {formatQuestionType(
                                                    question.question_type
                                                )}
                                            </span>

                                            <span>
                                                {question.required
                                                    ? "Required"
                                                    : "Optional"}
                                            </span>

                                        </div>

                                        {Array.isArray(
                                            question.options
                                        ) &&
                                            question.options.length > 0 && (
                                                <div className="question-options">

                                                    <span>
                                                        Options:
                                                    </span>

                                                    <ul>
                                                        {question.options.map(
                                                            (
                                                                option,
                                                                optionIndex
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        optionIndex
                                                                    }
                                                                >
                                                                    {option}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>

                                                </div>
                                            )}

                                    </div>
                                )
                            )}

                        </div>
                    )}

            </div>

            {/* ==================== MAIN SURVEY QUESTIONS ==================== */}

            <div className="survey-questions-section">

                <div className="survey-questions-header">

                    <h3>Survey Questions</h3>

                    <button
                        type="button"
                        className="add-screening-btn"
                        onClick={() =>
                            setShowAddQuestion(true)
                        }
                    >
                        + Add Question
                    </button>

                </div>

                {isLoadingQuestions && (
                    <p className="questions-message">
                        Loading questions...
                    </p>
                )}

                {!isLoadingQuestions &&
                    questionError && (
                        <p className="questions-error">
                            {questionError}
                        </p>
                    )}

                {!isLoadingQuestions &&
                    !questionError &&
                    questions.length === 0 && (
                        <p className="questions-message">
                            No questions added to this survey yet.
                        </p>
                    )}

                {!isLoadingQuestions &&
                    !questionError &&
                    questions.length > 0 && (
                        <div className="questions-list">

                            {questions.map(
                                (question, index) => (
                                    <div
                                        className="survey-question-card"
                                        key={question.id}
                                        onClick={() =>
                                            setEditingQuestion(
                                                question
                                            )
                                        }
                                        style={{
                                            cursor: "pointer",
                                        }}
                                    >

                                        <div className="question-number">
                                            <span>
                                                Question{" "}
                                                {index + 1}
                                            </span>
                                        </div>

                                        <div className="question-text">
                                            <strong>
                                                {question.question_text}
                                            </strong>
                                        </div>

                                        <div className="question-meta">

                                            <span>
                                                Type:{" "}
                                                {formatQuestionType(
                                                    question.question_type
                                                )}
                                            </span>

                                            <span>
                                                {question.required
                                                    ? "Required"
                                                    : "Optional"}
                                            </span>

                                        </div>

                                        {Array.isArray(
                                            question.options
                                        ) &&
                                            question.options.length > 0 && (
                                                <div className="question-options">

                                                    <span>
                                                        Options:
                                                    </span>

                                                    <ul>
                                                        {question.options.map(
                                                            (
                                                                option,
                                                                optionIndex
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        optionIndex
                                                                    }
                                                                >
                                                                    {option}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>

                                                </div>
                                            )}

                                    </div>
                                )
                            )}

                        </div>
                    )}

            </div>

            {/* ==================== FOOTER ==================== */}

            <div className="survey-details-footer">

                <button
                    type="button"
                    className="copy-survey-link-btn"
                    onClick={handleCopyPublicLink}
                >
                    {linkCopied
                        ? "✓ Link Copied"
                        : "🔗 Copy Public Survey Link"}
                </button>

                <button
                    type="button"
                    className="survey-details-close-btn"
                    onClick={onClose}
                >
                    Close
                </button>

            </div>

            {/* ==================== ADD MAIN QUESTION POPUP ==================== */}

            {showAddQuestion && (
                <AddQuestion
                    surveyId={survey.id}
                    onClose={() =>
                        setShowAddQuestion(false)
                    }
                    onQuestionAdded={(newQuestion) => {
                        setQuestions((previous) => [
                            ...previous,
                            newQuestion,
                        ]);
                    }}
                />
            )}

            {/* ==================== ADD SCREENING QUESTION POPUP ==================== */}

            {showAddScreening && (
                <AddScreeningQuestion
                    surveyId={survey.id}
                    onClose={() =>
                        setShowAddScreening(false)
                    }
                    onQuestionCreated={(newQuestion) => {
                        setScreeningQuestions(
                            (previous) => [
                                ...previous,
                                newQuestion,
                            ]
                        );
                    }}
                />
            )}

            {/* ==================== EDIT MAIN QUESTION ==================== */}

            {editingQuestion && (
                <EditQuestion
                    question={editingQuestion}
                    onClose={() =>
                        setEditingQuestion(null)
                    }
                    onQuestionUpdated={(updatedQuestion) => {
                        setQuestions((previous) =>
                            previous.map(
                                (question) =>
                                    question.id ===
                                    updatedQuestion.id
                                        ? updatedQuestion
                                        : question
                            )
                        );

                        setEditingQuestion(null);
                    }}
                />
            )}

            {/* ==================== VENDOR ALLOCATION POPUP ==================== */}

            {showAllocationForm && (
                <div className="allocation-modal-overlay">

                    <div className="allocation-modal">

                        <div className="allocation-modal-header">

                            <h3>
                                {editingAllocation
                                    ? "Edit Vendor Allocation"
                                    : "Add Vendor Allocation"}
                            </h3>

                            <button
                                type="button"
                                onClick={
                                    handleCancelAllocation
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleSaveAllocation
                            }
                        >

                            <div className="allocation-form-grid">

                                <div>
                                    <label>Vendor</label>

                                    <select
                                        name="vendor_id"
                                        value={
                                            allocationForm.vendor_id
                                        }
                                        onChange={
                                            handleAllocationInput
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select Vendor
                                        </option>

                                        {vendors.map(
                                            (vendor) => (
                                                <option
                                                    key={vendor.id}
                                                    value={vendor.id}
                                                >
                                                    {vendor.company ||
                                                        vendor.name}
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
                                        name="assigned_completes"
                                        min="0"
                                        value={
                                            allocationForm.assigned_completes
                                        }
                                        onChange={
                                            handleAllocationInput
                                        }
                                        required
                                    />

                                </div>

                                <div>
                                    <label>
                                        Delivered Completes
                                    </label>

                                    <input
                                        type="number"
                                        name="delivered_completes"
                                        min="0"
                                        value={
                                            allocationForm.delivered_completes
                                        }
                                        onChange={
                                            handleAllocationInput
                                        }
                                    />
                                </div>

                                <div>
                                    <label>
                                        Valid Completes
                                    </label>

                                    <input
                                        type="number"
                                        name="valid_completes"
                                        min="0"
                                        value={
                                            allocationForm.valid_completes
                                        }
                                        onChange={
                                            handleAllocationInput
                                        }
                                    />
                                </div>

                                <div>
                                    <label>
                                        Vendor CPI
                                    </label>

                                    <input
                                        type="number"
                                        name="vendor_cpi"
                                        min="0"
                                        step="0.01"
                                        value={
                                            allocationForm.vendor_cpi
                                        }
                                        onChange={
                                            handleAllocationInput
                                        }
                                    />
                                </div>

                                <div>
                                    <label>
                                        Feasibility
                                    </label>

                                    <input
                                        type="number"
                                        name="feasibility"
                                        min="0"
                                        value={
                                            allocationForm.feasibility
                                        }
                                        onChange={
                                            handleAllocationInput
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Status</label>

                                    <select
                                        name="status"
                                        value={
                                            allocationForm.status
                                        }
                                        onChange={
                                            handleAllocationInput
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

                                <div className="allocation-notes-field">

                                    <label>Notes</label>

                                    <textarea
                                        name="notes"
                                        rows="3"
                                        value={
                                            allocationForm.notes
                                        }
                                        onChange={
                                            handleAllocationInput
                                        }
                                        placeholder="Optional notes"
                                    />

                                </div>

                            </div>

                            <div className="allocation-modal-actions">

                                <button
                                    type="button"
                                    onClick={
                                        handleCancelAllocation
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isSavingAllocation
                                    }
                                >
                                    {isSavingAllocation
                                        ? "Saving..."
                                        : editingAllocation
                                            ? "Update Allocation"
                                            : "Add Allocation"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

function formatQuestionType(type) {
    const types = {
        text: "Text",
        single_choice: "Single Choice",
        multiple_choice: "Multiple Choice",
        rating: "Rating",
        yes_no: "Yes / No",
    };

    return types[type] || type || "Unknown";
}

export default SurveyDetails;