"use client";
import React from "react";
import styles from "./Modal.module.css"; // Importando os estilos específicos do modal

const Modal = ({ isVisible, title, children, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {/* Logo centralizado acima */}
        <div className={styles.logoContainer}>
          <img src="/heurist-logo_2.svg" alt="Heurist Logo" className={styles.logo} />
        </div>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default Modal;
