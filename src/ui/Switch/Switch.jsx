import React from "react";
import styles from "./switch.module.css";

// Segmented switch between a few options: options = [{ value, label, title? }]
export default function Switch({ options, value, onChange }) {
  return (
    <div className={styles.switch} role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          title={option.title}
          className={option.value === value ? `${styles.option} ${styles.active}` : styles.option}
          onClick={() => option.value !== value && onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
