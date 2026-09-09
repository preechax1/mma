import React from "react";

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          width: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
        }}
      >
        <button
          onClick={onClose}
          style={{
            float: "right",
            border: "none",
            background: "red",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          X
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;