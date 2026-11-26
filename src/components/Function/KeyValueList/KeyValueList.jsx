import React from "react";
import styles from "./keyValueList.module.css";

// Rows of key / value inputs, one per entry of `object`. Keys come from the
// template, so only values are editable.
export default function KeyValueList({ object, onChange, emptyText }) {
  const entries = Object.entries(object);

  if (entries.length === 0) {
    return <div className={styles.empty}>{emptyText}</div>;
  }

  return (
    <div className={styles.list}>
      {entries.map(([key, value]) => (
        <div key={key} className={styles.row}>
          <div className={styles.key} title={key}>
            {key}
          </div>
          <input
            className={styles.value}
            type="text"
            value={typeof value === "string" ? value : JSON.stringify(value)}
            onChange={(e) => onChange({ ...object, [key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
