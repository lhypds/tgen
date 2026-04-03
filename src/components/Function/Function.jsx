import React, { useEffect, useMemo, useState } from "react";
import styles from "./function.module.css";
import { showToast } from "../../ui";
import { copyText } from "../../utils/copyUtils";
import { extractKeys } from "../../utils/templeteUtils";
import { buildObjectFromJson } from "../../utils/jsonUtils";
import Edit from "./Edit";

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
  let isFunctionPage = false;
  if (selectedFunction) {
    if (selectedFunction !== fn.name) {
      return null;
    } else {
      isFunctionPage = true;
    }
  }

  const [args, setArgs] = useState(() => buildInitialArgs(fn, searchParams));
  const [editOpen, setEditOpen] = useState(false);

  function updateFields(field, newValue, current) {
    // Update the changed field
    const updated = {
      ...current,
      [field.key]: newValue,
    };

    // Trigger updates for fields
    if (field.triggerUpdates && field.triggerUpdates.length > 0) {
      for (const update of field.triggerUpdates) {
        // Update method: extract_keys
        // Extract keys `{}` from a text field to a json field.
        if (update.method === "extract_keys") {
          const keys = extractKeys(newValue);
          let existing = {};
          try {
            existing = buildObjectFromJson(current[update.field] ?? "");
          } catch {
            existing = {};
          }

          // Keep existing values for keys still present, add new keys with "", remove stale keys
          const merged = {};
          for (const key of keys) {
            merged[key] = key in existing ? existing[key] : "";
          }
          updated[update.field] = keys.length > 0 ? JSON.stringify(merged, null, 2) : "";
        }
      }
    }
    return updated;
  }

  // Initialize fields
  useEffect(() => {
    setArgs((prev) => {
      let current = { ...prev };

      // Update if needed
      for (const field of fn.fields) {
        current = updateFields(field, current[field.key], current);
      }
      return current;
    });
  }, []);

  // Update result when args change
  const result = useMemo(() => fn.exec(args), [args]);

  // For the input fields
  const fields = useMemo(
    () =>
      fn.fields.map((field) => ({
        ...field,
        onChange: (event) => setArgs((prev) => updateFields(field, event.target.value, prev)),
      })),
    [args],
  );

  async function handleShare() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Set function
    params.set("function", fn.name);

    // Set title
    if (isFunctionPage) {
      params.set("title", searchParams.get("title") || fn.title);
    }

    // Set share args, for creating shareable function links
    for (const shareArg of fn.shareArgs) {
      params.set(shareArg, args[shareArg]);
    }

    url.search = params.toString();
    const copied = await copyText(url.toString());
    if (copied) {
      showToast("Link copied to clipboard");
    } else {
      showToast("Failed to copy link");
    }
  }

  async function handleCopyResult() {
    if (!result.text || result.error) {
      showToast("Nothing to copy");
      return;
    }

    const copied = await copyText(result);
    if (copied) {
      showToast("Result copied to clipboard");
    } else {
      showToast("Failed to copy result");
    }
  }

  function handleSaveTitle(newTitle) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Set function
    params.set("function", fn.name);

    // Set args
    for (const key of Object.keys(fn.args)) {
      params.set(key, args[key]);
    }

    // Set new title
    if (newTitle) {
      params.set("title", newTitle);
    }

    url.search = params.toString();
    window.location.assign(url.toString());
  }

  async function handleTitleClick() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Set function
    params.set("function", fn.name);

    // Set title
    if (isFunctionPage) {
      params.set("title", searchParams.get("title") || fn.title);
    }

    // Set args
    for (const key of Object.keys(fn.args)) {
      params.set(key, args[key]);
    }

    url.search = params.toString();
    window.location.assign(url.toString());
  }

  return (
    <>
      <Edit
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        currentTitle={searchParams.get("title") || fn.title}
        onSave={handleSaveTitle}
      />
      <section className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleDescription}>
            <div className={styles.titleRow}>
              <div className={styles.title} onClick={handleTitleClick}>
                {searchParams.get("title") || fn.title}
              </div>
              <div className={styles.functionName}>(`{fn.name}`)</div>
            </div>
            <div className={styles.description}>{fn.description}</div>
          </div>

          <div className={styles.actions}>
            {/* Edit */}
            {isFunctionPage && (
              <button type="button" className={styles.actionButton} data-tooltip="Edit" onClick={() => setEditOpen(true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.editIcon}>
                  <path d="M3 21l3.75-.75L19 8l-3-3L3.75 17.25 3 21z" />
                  <path d="M14 6l3 3" />
                </svg>
              </button>
            )}

            {/* Share */}
            <button type="button" className={styles.actionButton} data-tooltip="Share" onClick={handleShare}>
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

        {/* Fields */}
        <div className={styles.arguments}>
          <div className={styles.grid}>
            {fields.map((field) => (
              <div key={field.label}>
                <label>
                  {field.label} (`{field.key}`)
                </label>

                {/* textarea or static value */}
                {field.type === "text" || field.type === "json" ? (
                  <textarea
                    rows={field.rows ?? 4}
                    value={args[field.key]}
                    onChange={field.onChange}
                    placeholder={field.placeholder}
                  />
                ) : (
                  // Ineditable
                  <pre>{args[field.key]}</pre>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.result}>
          <div className={styles.resultLabelRow}>
            <label>Result</label>

            {/* Copy */}
            <button type="button" className={styles.actionButton} data-tooltip="Copy" onClick={handleCopyResult}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.shareIcon}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
          <div>
            <pre className={styles.resultText}>{result.error ? `Error: ${result.error}` : result.text}</pre>
          </div>
        </div>
      </section>
    </>
  );
}
