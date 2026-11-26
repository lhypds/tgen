import React, { useEffect, useRef, useState } from "react";
import styles from "./dropdown.module.css";

// The app's own dropdown, ported from liveboard: a bordered trigger with an absolutely
// positioned column of options, opened by hover or click and inverted to black on hover.
// A native <select> would render the OS widget instead.
// align="right" anchors the list to the trigger's right edge (for a trigger at the right of the page).
export default function Dropdown({ value, options, onChange, ariaLabel, align = "left" }) {
  const [open, setOpen] = useState(false);
  // A pick leaves the pointer inside the wrapper, where the hover rule would hold the list
  // open; this latches it shut until the pointer comes back over the trigger (see the CSS)
  const [dismissed, setDismissed] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  const current = options.find((o) => o.value === value) ?? options[0];

  function pick(next) {
    if (next !== value) onChange(next);
    setOpen(false);
    setDismissed(true);
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper} data-open={open} data-dismissed={dismissed} data-align={align}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onPointerEnter={() => setDismissed(false)}
        onClick={() => {
          setDismissed(false);
          setOpen((v) => !v);
        }}
      >
        <span className={styles.triggerLabel}>{current?.label}</span>
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </button>
      <div className={styles.dropdown} role="listbox" aria-label={ariaLabel}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="option"
            aria-selected={o.value === value}
            className={o.value === value ? `${styles.option} ${styles.active}` : styles.option}
            onClick={() => pick(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
