"use client";
import React from "react";
import axios from "axios";
import styles from "./FloatingButton.module.css";

const FloatingButton = ({ onClick }) => {
  const handleNewDecision = async () => {
    try {
      const response = await axios.post("http://localhost:8000/initiate/");
      console.log("Resposta do backend:", response.data.message);
      onClick();
    } catch (error) {
      console.error("Erro ao iniciar nova decisão:", error);
    }
  };

  return (
    <div className={styles.tooltipContainer}>
      {/* Botão flutuante */}
      <button className={styles.floatingButton} onClick={handleNewDecision}>
        <img
          src="/heurist-ico.svg"
          alt="Nova Decisão"
          className={styles.icon}
        />
      </button>

      {/* Tooltip */}
      <span className={styles.tooltip}>New Decision</span>
    </div>
  );
};

export default FloatingButton;
