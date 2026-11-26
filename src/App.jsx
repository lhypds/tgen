import React, { useState } from "react";
import * as functions from "./functions";
import Function from "./components/Function";
import styles from "./app.module.css";
import { Toast, Switch } from "./ui";

const FUNCTIONS = Object.values(functions);

function initialFunctionName() {
  const name = new URLSearchParams(window.location.search).get("function");
  return FUNCTIONS.some((fn) => fn.name === name) ? name : FUNCTIONS[0].name;
}

export default function App() {
  const [selected, setSelected] = useState(initialFunctionName);
  const fn = FUNCTIONS.find((f) => f.name === selected);

  function handleSelect(name) {
    // URL args belong to the function they were shared for; drop them when switching
    window.history.replaceState(null, "", window.location.pathname);
    setSelected(name);
  }

  return (
    <main className={styles.main}>
      <Toast />
      <div className={styles.topBar}>
        <div className={styles.title}>
          <a href="/">tgen</a>
        </div>

        {/* Function selector: F1, F2, ... */}
        <Switch
          options={FUNCTIONS.map((f, i) => ({ value: f.name, label: `F${i + 1}`, title: `${f.title} (${f.name})` }))}
          value={selected}
          onChange={handleSelect}
        />
      </div>

      {/* One function at a time; key remounts it with fresh state on switch */}
      <Function key={fn.name} fn={fn} />
    </main>
  );
}
