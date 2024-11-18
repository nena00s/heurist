"use client";
import React from "react";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen, decisions, onClose, onSelectDecision }) => {
  if (!isOpen) return null; // Não renderiza nada se não estiver aberto

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose(); // Fecha o modal ao clicar fora
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2>Your Decisions</h2>
        <div className={styles.scrollArea}>
          {Array.isArray(decisions) && decisions.length > 0 ? (
            decisions.map((decision, index) => (
              <div
                key={index}
                className={styles.decision}
                onClick={() => {
                  onSelectDecision(decision);
                  onClose(); // Fecha o modal ao selecionar uma decisão
                }}
              >
                {decision.title}
              </div>
            ))
          ) : (
            <p className={styles.noDecisions}>No decisions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
