import React from "react";
import { function1, function2 } from "./functions";
import Function from "./components/Function";
import styles from "./app.module.css";

export default function App() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        <a href="/">tgen</a>
      </h1>

      {/* Functions */}
      <Function function_={function1} />
      <Function function_={function2} />
    </main>
  );
}
