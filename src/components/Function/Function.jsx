import React, { useMemo, useState } from "react";
import styles from "./function.module.css";
import { showToast } from "../../ui";
import { copyText } from "../../utils/copyUtils";

const buildInitialArgs = (fn, searchParams) => {
  const initialArgs = { ...fn.args };
  for (const key of Object.keys(initialArgs)) {
    const value = searchParams.get(key);
    if (value !== null) {
      initialArgs[key] = value;
    }
  }
  return initialArgs;
};

export default function Function(props) {
  const { fn } = props;

  // Search params to initial args
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const selectedFunction = searchParams.get("function");
  if (selectedFunction && selectedFunction !== fn.name) {
    return null;
  }

  const [args, setArgs] = useState(() => buildInitialArgs(fn, searchParams));

  // Update result when args change
  const result = useMemo(() => fn.exec(args), [args]);

  // For the input fields
  const fields = useMemo(
    () =>
      fn.fields.map((field) => ({
        ...field,
        onChange: (event) =>
          setArgs((prev) => ({
            ...prev,
            [field.key]: event.target.value, // Update the args's value when input changes
          })),
      })),
    [args],
  );

  async function handleShare() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Set function
    params.set("function", fn.name);

    // Set template args
    for (const key of Object.keys(fn.templateArgs)) {
      params.set(key, args[key]);
    }

    url.search = params.toString();
    const copied = await copyText(url.toString());
    if (copied) {
      showToast("Link copied to clipboard");
    } else {
      showToast("Failed to copy link");
    }
  }

  async function handleEdit() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Set function
    params.set("function", fn.name);

    // Set template args
    for (const key of Object.keys(fn.templateArgs)) {
      params.set(key, args[key]);
    }

    url.search = params.toString();
    const copied = await copyText(url.toString());
    if (copied) {
      showToast("Link copied to clipboard");
    } else {
      showToast("Failed to copy link");
    }
  }

  async function handleTitleClick() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Set function
    params.set("function", fn.name);

    // Set args
    for (const key of Object.keys(fn.args)) {
      params.set(key, args[key]);
    }

    url.search = params.toString();
    window.location.assign(url.toString());
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleDescription}>
          <div className={styles.titleRow}>
            <div className={styles.title} onClick={handleTitleClick}>
              {fn.title}
            </div>
            <div className={styles.functionName}>(`{fn.name}`)</div>
          </div>
          <div className={styles.description}>{fn.description}</div>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.actionButton} onClick={handleEdit}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.editIcon}>
              <path d="M3 21l3.75-.75L19 8l-3-3L3.75 17.25 3 21z" />
              <path d="M14 6l3 3" />
            </svg>
          </button>
          <button type="button" className={styles.actionButton} onClick={handleShare}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.shareIcon}>
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 3.98" />
              <path d="M15.41 6.51L8.59 10.49" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.arguments}>
        <div className={styles.grid}>
          {fields.map((field) => (
            <div key={field.label}>
              <label>
                {field.label} (`{field.key}`)
              </label>

              {/* textarea or static value */}
              {field.inputbox === "textarea" ? (
                <textarea
                  rows={field.rows ?? 4}
                  value={args[field.key]}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                />
              ) : (
                <pre>{args[field.key]}</pre>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.result}>
        <label>Result</label>
        <div>
          <pre>{result.error ? `Error: ${result.error}` : result.text}</pre>
        </div>
      </div>
    </section>
  );
}
