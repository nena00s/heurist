//frontend/app/components/ResultCard.js

"use client";
import React from "react";
import styles from "./ResultCard.module.css";

const ResultCard = ({ universe, description, onExplore }) => {
  const truncatedDescription =
    description.length > 100 ? `${description.substring(0, 100)}...` : description;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{universe}</h3>
      <p className={styles.description}>{truncatedDescription}</p>
      <button className={styles.exploreButton} onClick={onExplore}>
        Explore
      </button>
    </div>
  );
};

export default ResultCard;
