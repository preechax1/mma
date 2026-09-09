import React from "react";
import { createPortal } from "react-dom";
import "./Styles/modal.css";

const Modal = ({ open, onClose, children, title = "Modal" }) => {
    if (!open) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;