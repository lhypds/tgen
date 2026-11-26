import React, { useEffect, useMemo, useState } from "react";
import styles from "./function.module.css";
import { showToast } from "@/ui";
import { copyText } from "@utils/copyUtils";
import { extractKeys } from "@utils/templeteUtils";
import { buildObjectFromJson } from "@utils/jsonUtils";
import Edit from "./Edit";
import KeyValueList from "./KeyValueList";
import { ActionButton, TextArea, Switch } from "@/ui";

const DEFAULT_MIN_HEIGHT = 96;

const INPUT_MODES = [
  { value: "kv", label: "Key value" },
  { value: "json", label: "JSON" },
];

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

function parseObject(jsonText) {
  try {
    return buildObjectFromJson(jsonText ?? "");
  } catch {
    return null;
  }
}

function stringifyObject(object) {
  return Object.keys(object).length > 0 ? JSON.stringify(object, null, 2) : "";
}

export default function Function(props) {
  const { fn } = props;

  // Search params to initial args; they belong to this function only if it is the one named in the URL
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const isFunctionPage = searchParams.get("function") === fn.name;
  const urlParams = useMemo(() => (isFunctionPage ? searchParams : new URLSearchParams()), []);

  const [args, setArgs] = useState(() => buildInitialArgs(fn, urlParams));
  const [editOpen, setEditOpen] = useState(false);
  const [inputMode, setInputMode] = useState("kv");
  const [thinking, setThinking] = useState(false);

  const title = (isFunctionPage && searchParams.get("title")) || fn.title;

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
        // Extract keys `{{key}}` from a text field to a json field.
        if (update.method === "extract_keys") {
          const keys = extractKeys(newValue);
          const existing = parseObject(current[update.field]) ?? {};

          // Keep existing values for keys still present, add new keys with "", remove stale keys
          const merged = {};
          for (const key of keys) {
            merged[key] = key in existing ? existing[key] : "";
          }
          updated[update.field] = stringifyObject(merged);
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

  function setField(field, value) {
    setArgs((prev) => updateFields(field, value, prev));
  }

  function handleInputModeChange(field, mode) {
    if (mode === "kv" && parseObject(args[field.key]) === null) {
      showToast("Fix the JSON before switching");
      return;
    }
    setInputMode(mode);
  }

  async function handleShare() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Set function
    params.set("function", fn.name);

    // Set title
    if (isFunctionPage) {
      params.set("title", title);
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

  // Brain: let AI find the parts of the template that should be {{key}} placeholders
  async function handleBrain() {
    // fallbackField: where to take an example text from when the template is still empty
    const { field: templateKey, valuesField, fallbackField } = fn.brain;
    const templateField = fn.fields.find((f) => f.key === templateKey);
    let text = args[templateKey];
    if (!text.trim() && fallbackField) {
      text = args[fallbackField];
    }
    if (!text.trim()) {
      const labels = [templateKey, fallbackField].filter(Boolean).map((key) => fn.fields.find((f) => f.key === key).label);
      showToast(`${labels.join(" / ")} is empty`);
      return;
    }

    setThinking(true);
    try {
      const response = await fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      setArgs((prev) => {
        const updated = updateFields(templateField, data.template, prev);

        // Prefill the original values the placeholders replaced
        if (valuesField) {
          const values = parseObject(updated[valuesField]) ?? {};
          for (const { key, value } of data.values) {
            if (key in values && value && !values[key]) {
              values[key] = value;
            }
          }
          updated[valuesField] = stringifyObject(values);
        }
        return updated;
      });
      showToast(data.values.length > 0 ? `Found ${data.values.length} placeholder(s)` : "Nothing to replace");
    } catch (error) {
      showToast(error.message || "AI request failed");
    } finally {
      setThinking(false);
    }
  }

  async function handleCopyResult() {
    if (!result.text || result.error) {
      showToast("Nothing to copy");
      return;
    }

    const copied = await copyText(result.text);
    if (copied) {
      showToast("Result copied to clipboard");
    } else {
      showToast("Failed to copy result");
    }
  }

  // Navigate to this function's own page with its current args (and a title)
  function goToFunctionPage(newTitle) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Set function
    params.set("function", fn.name);

    // Set args
    for (const key of Object.keys(fn.args)) {
      params.set(key, args[key]);
    }

    // Set title
    if (newTitle) {
      params.set("title", newTitle);
    }

    url.search = params.toString();
    window.location.assign(url.toString());
  }

  function renderField(field) {
    const minHeight = field.minHeight ?? DEFAULT_MIN_HEIGHT;

    // Params: key value list or JSON, switchable
    if (field.type === "params") {
      const object = parseObject(args[field.key]);
      return (
        <>
          <div className={styles.labelRow}>
            <label>
              {field.label} (`{field.key}`)
            </label>
            <Switch
              options={INPUT_MODES}
              value={inputMode}
              onChange={(mode) => handleInputModeChange(field, mode)}
            />
          </div>
          {inputMode === "kv" && object !== null ? (
            <KeyValueList
              object={object}
              onChange={(next) => setField(field, stringifyObject(next))}
              emptyText={field.emptyText ?? "No keys yet"}
            />
          ) : (
            <TextArea
              minHeight={minHeight}
              value={args[field.key]}
              onChange={(e) => setField(field, e.target.value)}
              placeholder={field.placeholder}
            />
          )}
        </>
      );
    }

    return (
      <>
        <div className={styles.labelRow}>
          <label>
            {field.label} (`{field.key}`)
          </label>
        </div>
        {field.type === "text" || field.type === "json" ? (
          <TextArea
            minHeight={minHeight}
            value={args[field.key]}
            onChange={(e) => setField(field, e.target.value)}
            placeholder={field.placeholder}
          />
        ) : (
          // Ineditable
          <pre>{args[field.key]}</pre>
        )}
      </>
    );
  }

  return (
    <>
      <Edit
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        currentTitle={title}
        onSave={goToFunctionPage}
      />
      <section className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titleDescription}>
            <div className={styles.titleRow}>
              <div className={styles.title} onClick={() => goToFunctionPage(isFunctionPage ? title : "")}>
                {title}
              </div>
              <div className={styles.functionName}>(`{fn.name}`)</div>
            </div>
            <div className={styles.description}>{fn.description}</div>
          </div>

          <div className={styles.actions}>
            {/* Edit */}
            {isFunctionPage && (
              <ActionButton tooltip="Edit" onClick={() => setEditOpen(true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 21l3.75-.75L19 8l-3-3L3.75 17.25 3 21z" />
                  <path d="M14 6l3 3" />
                </svg>
              </ActionButton>
            )}

            {/* Brain */}
            {fn.brain && (
              <ActionButton tooltip={thinking ? "Thinking..." : "AI placeholders"} onClick={handleBrain} disabled={thinking}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4.5A4.5 4.5 0 0 0 4 7.3 4 4 0 0 0 3.2 14 4.6 4.6 0 0 0 12 19.5" />
                  <path d="M12 4.5A4.5 4.5 0 0 1 20 7.3 4 4 0 0 1 20.8 14 4.6 4.6 0 0 1 12 19.5" />
                  <path d="M12 4.5v15" />
                </svg>
              </ActionButton>
            )}

            {/* Share */}
            <ActionButton tooltip="Share" onClick={handleShare}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98" />
                <path d="M15.41 6.51L8.59 10.49" />
              </svg>
            </ActionButton>
          </div>
        </div>

        {/* Fields */}
        <div className={styles.arguments}>
          <div className={fn.layout === "column" ? `${styles.grid} ${styles.column}` : styles.grid}>
            {fn.fields.map((field) => (
              <div key={field.key}>{renderField(field)}</div>
            ))}
          </div>
        </div>

        <div className={styles.result}>
          <div className={styles.labelRow}>
            <label>Result</label>

            {/* Copy */}
            <ActionButton tooltip="Copy" onClick={handleCopyResult}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </ActionButton>
          </div>
          <div>
            <pre className={styles.resultText}>{result.error ? `Error: ${result.error}` : result.text}</pre>
          </div>
        </div>
      </section>
    </>
  );
}
