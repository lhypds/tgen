import React, { useMemo, useState } from "react";
import styles from "./function.module.css";

export default function Function(props) {
  const { function_ } = props;

  // Search params to initial args
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const selectedFunction = searchParams.get("function");
  if (selectedFunction && selectedFunction !== function_.name) {
    return null;
  }

  const buildInitialArgs = (fn) => {
    const initialArgs = { ...fn.args };
    for (const key of Object.keys(initialArgs)) {
      const value = searchParams.get(key);
      if (value !== null) {
        initialArgs[key] = value;
      }
    }
    return initialArgs;
  };
  const initialArgs = useMemo(() => buildInitialArgs(function_), [function_]);

  const [args, setArgs] = useState(() => ({ ...initialArgs }));
  const result = useMemo(() => function_.exec(args), [args]);

  const fields = useMemo(
    () =>
      function_.fields.map((field) => ({
        ...field,
        value: args[field.key] ?? "",
        onChange: (event) => setArgs((prev) => ({ ...prev, [field.key]: event.target.value })),
      })),
    [args],
  );

  async function handleShare() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    params.set("function", function_.name);

    for (const field of fields) {
      if (!field.key || !args[field.key]) {
        continue;
      }
      params.set(field.key, args[field.key]);
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
          <div className={styles.titleRow}>
            <div className={styles.title}>{function_.title}</div>
            <div className={styles.functionName}>(`{function_.name}`)</div>
          </div>
          <div className={styles.description}>{function_.description}</div>
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
