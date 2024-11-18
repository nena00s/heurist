"use client";
import React, { useState, useEffect } from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  const messages = [
    "Heurist | AI Multiverse Decisions Make Platform - 2024 - All Rights Reserved.",
    "The decisions simulated here are based on hypothetical scenarios and are not guarantees of actual results.",
    
    
  ];

  const [currentMessage, setCurrentMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prevMessage) => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 7000); // Troca a mensagem a cada 3 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, []);

  return (
    <footer className={styles.footer}>
      <p className={styles.text}>{currentMessage}</p>
    </footer>
  );
};

export default Footer;
