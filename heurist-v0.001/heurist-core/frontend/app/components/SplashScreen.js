"use client";
import React, { useEffect, useState } from "react";
import styles from "./SplashScreen.module.css";

const SplashScreen = ({ onFinish }) => {
  const [stage, setStage] = useState(0); // Controla as etapas da animação

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1500), // Após 1.5s: mostra o slogan
      setTimeout(() => setStage(2), 4000), // Após 4s: fade out do logo e texto
      setTimeout(() => setStage(3), 4500), // Após 4.5s: mostra "Welcome"
      setTimeout(() => setStage(4), 6000), // Após 6s: fade out do "Welcome"
      setTimeout(() => onFinish(), 7500), // Após 7.5s: finaliza o splash
    ];

    return () => timers.forEach(clearTimeout); // Limpa os timeouts ao desmontar
  }, [onFinish]);

  return (
    <div className={`${styles.splashScreen} ${stage === 4 ? styles.hidden : ""}`}>
      {stage < 2 && (
        <div className={styles.contentWrapper}>
          <img
            src="/heurist-logo_2.svg"
            alt="Heurist Logo"
            className={`${styles.logo} ${stage === 2 ? styles.fadeOut : styles.fadeIn}`}
          />
          {stage >= 1 && (
            <p className={`${styles.text} ${stage === 2 ? styles.fadeOut : styles.fadeIn}`}>
              AI Multiverse Decisions Make Platform
            </p>
          )}
        </div>
      )}
      {stage === 3 && (
        <p className={`${styles.welcome} ${styles.fadeIn}`}>Welcome</p>
      )}
    </div>

  );
};

export default SplashScreen;
