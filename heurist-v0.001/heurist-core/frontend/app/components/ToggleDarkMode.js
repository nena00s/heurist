//frontend/app/components/ToggleDarkMode.js

"use client";
import React, { useState } from "react";

const ToggleDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  return (
    <button onClick={toggleDarkMode} className="dark-mode-toggle">
      {isDarkMode ? "🌙" : "☀️"}
    </button>
  );
};

export default ToggleDarkMode;
