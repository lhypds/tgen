import React, { useMemo, useState } from "react";
import { function1, function2, parseFunctionQuery } from "./functions";
import Function from "./components/Function";
import styles from "./app.module.css";

function buildParamsFromJson(jsonText) {
  if (!jsonText.trim()) {
    return {};
  }

  const parsed = JSON.parse(jsonText);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("f1_input_json must be a JSON object");
  }
  return parsed;
}

export default function App() {
  const queryData = useMemo(() => parseFunctionQuery(window.location.search), []);

  const [f1Template, setF1Template] = useState(queryData.f1?.templete ?? "");
  const [f1InputJson, setF1InputJson] = useState(queryData.f1?.input ?? "");

  const [f2Input, setF2Input] = useState(queryData.f2?.input ?? "");
  const [f2Template1, setF2Template1] = useState(queryData.f2?.templete1 ?? "");
  const [f2Template2, setF2Template2] = useState(queryData.f2?.templete2 ?? "");

  const f1Result = useMemo(() => {
    try {
      const params = buildParamsFromJson(f1InputJson);
      return { value: function1(f1Template, params), error: null };
    } catch (error) {
      return { value: "", error: error.message };
    }
  }, [f1InputJson, f1Template]);

  const f2Result = useMemo(() => {
    try {
      return { value: function2(f2Input, f2Template1, f2Template2), error: null };
    } catch (error) {
      return { value: "", error: error.message };
    }
  }, [f2Input, f2Template1, f2Template2]);

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy text", error);
    }
  }

  const selectedFunction = queryData.function;
  const showFunction1 = !selectedFunction || selectedFunction === "function1";
  const showFunction2 = !selectedFunction || selectedFunction === "function2";

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        <a href="/">tgen</a>
      </h1>

      {showFunction1 && (
        <Function
          function_="function1"
          title="function1"
          description={[
            "Provide a string template with {} and text.",
            "Generate a string by replacing the {} with the corresponding values from the parameters.",
          ]}
          arguments={{
            template: "`template`",
          }}
          fields={[
            {
              label: "Template",
              type: "text",
              inputbox: "textarea",
              rows: 4,
              key: "template",
              value: f1Template,
              placeholder: "Today's weather is {weather}.",
              onChange: (event) => setF1Template(event.target.value),
            },
            {
              label: "Input JSON",
              type: "json",
              inputbox: "textarea",
              rows: 8,
              key: "input",
              value: f1InputJson,
              placeholder: '{\n  "weather": "sunny"\n}',
              onChange: (event) => setF1InputJson(event.target.value),
            },
          ]}
          result={f1Result.error ? `Error: ${f1Result.error}` : f1Result.value}
          onCopy={copyText}
        />
      )}

      {showFunction2 && (
        <Function
          function_="function2"
          title="function2"
          description={[
            "Provide a string 1, and template 1, and template 2.",
            "Read parameters from template 1, and generate a string based on template 2 with the extracted parameters.",
          ]}
          arguments={{
            template1: "`template1`",
            template2: "`template2`",
          }}
          fields={[
            {
              label: "Input",
              type: "text",
              inputbox: "textarea",
              rows: 4,
              key: "input",
              value: f2Input,
              placeholder: "Paris is France's capital.",
              onChange: (event) => setF2Input(event.target.value),
            },
            {
              label: "Template Input",
              type: "text",
              inputbox: "textarea",
              rows: 4,
              key: "template1",
              value: f2Template1,
              placeholder: "{capital} is {country}'s capital.",
              onChange: (event) => setF2Template1(event.target.value),
            },
            {
              label: "Template Output",
              type: "text",
              inputbox: "textarea",
              rows: 4,
              key: "template2",
              value: f2Template2,
              placeholder: "The capital of {country} is {capital}.",
              onChange: (event) => setF2Template2(event.target.value),
            },
          ]}
          result={f2Result.error ? `Error: ${f2Result.error}` : f2Result.value}
          onCopy={copyText}
        />
      )}
    </main>
  );
}
