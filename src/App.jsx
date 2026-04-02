import React, { useMemo, useState } from "react";
import { function1, function2, parseFunctionQuery } from "./functions";
import Function from "./components/Function";
import styles from "./app.module.css";

export default function App() {
  const queryParams = useMemo(() => parseFunctionQuery(window.location.search), []);

  const [f1Args, setF1Args] = useState({
    template: queryParams.f1?.templete ?? "",
    params_: queryParams.f1?.input ?? "",
  });

  const [f2Args, setF2Args] = useState({
    input: queryParams.f2?.input ?? "",
    template1: queryParams.f2?.templete1 ?? "",
    template2: queryParams.f2?.templete2 ?? "",
  });

  useMemo(() => function1.exec(f1Args), [f1Args]);
  useMemo(() => function2.exec(f2Args), [f2Args]);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        <a href="/">tgen</a>
      </h1>

      {(!queryParams.function || queryParams.function === function1.name) && (
        <Function
          function_={function1.name}
          title={function1.title}
          description={function1.description}
          fields={function1.fields.map((field) => ({
            ...field,
            value: f1Args[field.key],
            onChange: (event) => setF1Args((prev) => ({ ...prev, [field.key]: event.target.value })),
          }))}
          args={f1Args}
          result={function1.result}
        />
      )}

      {(!queryParams.function || queryParams.function === function2.name) && (
        <Function
          function_={function2.name}
          title={function2.title}
          description={function2.description}
          fields={function2.fields.map((field) => ({
            ...field,
            value: f2Args[field.key],
            onChange: (event) => setF2Args((prev) => ({ ...prev, [field.key]: event.target.value })),
          }))}
          args={f2Args}
          result={function2.result}
        />
      )}
    </main>
  );
}
