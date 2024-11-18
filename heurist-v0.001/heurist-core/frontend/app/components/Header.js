//frontend/app/components/Header.js

"use client";
import React from "react";
import styles from "./Header.module.css"; // Importa o CSS Module

const Header = ({ toggleSidebar }) => {
  return (
    <header className={styles.header}>
      <button className={styles.sidebarTrigger} onClick={toggleSidebar}>
        ☰
      </button>
      <img
        src="/heurist-logo.svg" // Caminho para o logo no public
        alt="Heurist Logo"
        className={styles.logo}
      />
    </header>
  );
};

export default Header;
