import React from "react";
import styles from "./function.module.css";

export default function Function(props) {
  const { title, description, fields, result, function_ } = props;

  async function handleShare() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    params.set("function", function_);

    for (const field of fields) {
      if (!field.key || !field.value) {
        continue;
      }
      params.set(field.key, field.value);
    }

    url.search = params.toString();

    try {
      await navigator.clipboard.writeText(url.toString());
    } catch (error) {
      console.error("Failed to copy share url", error);
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleDescription}>
          <div className={styles.title}>{title}</div>
          <div className={styles.description}>
            {description[0]}
            <br />
            {description[1]}
          </div>
        </div>
        <button type="button" className={styles.shareButton} onClick={handleShare}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.shareIcon}>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98" />
            <path d="M15.41 6.51L8.59 10.49" />
          </svg>
        </button>
      </div>

      <div className={styles.description}></div>

      <div className={styles.arguments}>
        <div className={styles.grid}>
          {fields.map((field) => (
            <div key={field.label}>
              <label>
                {field.label} (`{field.key}`)
              </label>

              {/* textarea or static value */}
              {field.inputbox === "textarea" ? (
                <textarea rows={field.rows ?? 4} value={field.value} onChange={field.onChange} placeholder={field.placeholder} />
              ) : (
                <pre>{field.value}</pre>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.result}>
        <label>Result</label>
        <pre>{result}</pre>
      </div>
    </section>
  );
}
