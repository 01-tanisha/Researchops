import "./ConfirmationModal.css";

function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
}) {

    if (!isOpen) {
        return null;
    }

    return (
        <div className="confirmation-overlay">

            <div className="confirmation-modal">

                <div className="confirmation-icon">
                    !
                </div>

                <h2>{title}</h2>

                <p>{message}</p>

                <div className="confirmation-actions">

                    <button
                        className="confirmation-cancel"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        className="confirmation-confirm"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ConfirmationModal;
