import React from "react";
import "./dark-mode-toggle.css";

const DarkModeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <label className="dark-mode-toggle">
      <input
        type="checkbox"
        checked={isDarkMode}
        onChange={onToggle}
      />
      <span className="slider"></span>
    </label>
  );
};

export default DarkModeToggle;
