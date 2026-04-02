import React, { useMemo, useState } from "react";
import { function1, function2, parseFunctionQuery } from "./functions";
import Function from "./components/Function";
import styles from "./app.module.css";

export default function App() {
  const queryParams = useMemo(() => parseFunctionQuery(window.location.search), []);

  const [f1Template, setF1Template] = useState(queryParams.f1?.templete ?? "");
  const [f1InputJson, setF1InputJson] = useState(queryParams.f1?.input ?? "");

  const [f2Input, setF2Input] = useState(queryParams.f2?.input ?? "");
  const [f2Template1, setF2Template1] = useState(queryParams.f2?.templete1 ?? "");
  const [f2Template2, setF2Template2] = useState(queryParams.f2?.templete2 ?? "");

  useMemo(
    () =>
      function1.exec({
        template: f1Template ?? "",
        params_: f1InputJson ?? "",
      }),
    [f1InputJson, f1Template],
  );
  useMemo(
    () =>
      function2.exec({
        input: f2Input ?? "",
        template1: f2Template1 ?? "",
        template2: f2Template2 ?? "",
      }),
    [f2Input, f2Template1, f2Template2],
  );

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
          fields={[
            {
              key: "template",
              label: "Template",
              type: "text",
              inputbox: "textarea",
              rows: 4,
              value: f1Template,
              placeholder: "Today's weather is {weather}.",
              onChange: (event) => setF1Template(event.target.value),
            },
            {
              key: "input",
              label: "Input JSON",
              type: "json",
              inputbox: "textarea",
              rows: 8,
              value: f1InputJson,
              placeholder: '{\n  "weather": "sunny"\n}',
              onChange: (event) => setF1InputJson(event.target.value),
            },
          ]}
          result={function1.result}
        />
      )}

      {(!queryParams.function || queryParams.function === function2.name) && (
        <Function
          function_={function2.name}
          title={function2.title}
          description={function2.description}
          fields={[
            {
              key: "input",
              label: "Input",
              type: "text",
              inputbox: "textarea",
              rows: 4,
              value: f2Input,
              placeholder: "Paris is France's capital.",
              onChange: (event) => setF2Input(event.target.value),
            },
            {
              key: "template1",
              label: "Template Input",
              type: "text",
              inputbox: "textarea",
              rows: 4,
              value: f2Template1,
              placeholder: "{capital} is {country}'s capital.",
              onChange: (event) => setF2Template1(event.target.value),
            },
            {
              key: "template2",
              label: "Template Output",
              type: "text",
              inputbox: "textarea",
              rows: 4,
              value: f2Template2,
              placeholder: "The capital of {country} is {capital}.",
              onChange: (event) => setF2Template2(event.target.value),
            },
          ]}
          result={function2.result}
        />
      )}
    </main>
  );
}
