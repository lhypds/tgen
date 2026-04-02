import React from "react";
import { function1, function2 } from "./functions";
import Function from "./components/Function";
import styles from "./app.module.css";
import { Toast } from "./ui";

export default function App() {
  return (
    <main className={styles.main}>
      <Toast />
      <div className={styles.title}>
        <a href="/">tgen</a>
      </div>

      {/* Functions */}
      <div>
        <Function fn={function1} />
        <Function fn={function2} />
      </div>
    </main>
  );
}
