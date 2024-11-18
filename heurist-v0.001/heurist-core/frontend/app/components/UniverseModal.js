//frontend/app/components/UniverseModal.js


"use client";
import React, { useState } from "react";
import ChatModal from "./ChatModal"; // Importação do ChatModal
import styles from "./UniverseModal.module.css";

const UniverseModal = ({ isVisible, universe, description, onClose, parentTitle }) => {
  const [isChatVisible, setChatVisible] = useState(false);

  const handleChatOpen = () => {
    if (!universe) {
      console.error("Erro: O universo está vazio.");
      return;
    }
    setChatVisible(true);
  };

  const handleChatClose = () => {
    setChatVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <header className={styles.header}>
            <h2>{universe}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </header>
          <main className={styles.content}>
            <p>{description}</p>
            <button className={styles.chatButton} onClick={handleChatOpen}>
              Chat with this Universe
            </button>
          </main>
        </div>
      </div>
      {isChatVisible && (
        <ChatModal
          isVisible={isChatVisible}
          parentTitle={parentTitle}
          universe={universe} // Garante que o universo é passado
          onClose={handleChatClose}
        />
      )}
    </>
  );
};

export default UniverseModal;
