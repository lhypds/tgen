import React, { useMemo } from "react";
import { function1, function2, parseFunctionQuery } from "./functions";
import Function from "./components/Function";
import styles from "./app.module.css";

export default function App() {
  const queryParams = useMemo(() => parseFunctionQuery(window.location.search), []);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        <a href="/">tgen</a>
      </h1>

      {(!queryParams.function || queryParams.function === function1.name) && (
        <Function
          function_={function1}
          initialArgs={{
            ...function1.args,
            template: queryParams.f1?.templete ?? queryParams.f1?.template ?? "",
            params_: queryParams.f1?.input ?? "",
          }}
        />
      )}

      {(!queryParams.function || queryParams.function === function2.name) && (
        <Function
          function_={function2}
          initialArgs={{
            ...function2.args,
            input: queryParams.f2?.input ?? "",
            template1: queryParams.f2?.templete1 ?? queryParams.f2?.template1 ?? "",
            template2: queryParams.f2?.templete2 ?? queryParams.f2?.template2 ?? "",
          }}
        />
      )}
    </main>
  );
}
