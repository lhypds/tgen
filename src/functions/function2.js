import { buildCaptureRegex, extractKeys, prepareEscapes, restoreEscapes, TOKEN_REGEX } from '@utils/templeteUtils';

export const function2 = {
  name: "function2",
  title: "Extractor & Replacer",
  description: "Provide an input string, a template1 with {{key}} placeholders, and a template2 with {{key}} placeholders. Extract values from the input string based on template1, and generate a new string by replacing the {{key}} in template2 with the extracted values.",
  layout: "column",  // fields stacked top to bottom
  brain: { field: "template1", fallbackField: "input" },  // AI turns template input (or the input example) into {{key}} placeholders
  fields: [
    {
      key: "input",
      label: "Input",
      type: "text",
      minHeight: 140,
      placeholder: "Paris is France's capital.",
      triggerUpdates: [],
    },
    {
      key: "template1",
      label: "Template Input",
      type: "text",
      minHeight: 140,
      placeholder: "{{capital}} is {{country}}'s capital.",
      triggerUpdates: [],
    },
    {
      key: "template2",
      label: "Template Output",
      type: "text",
      minHeight: 140,
      placeholder: "The capital of {{country}} is {{capital}}.",
      triggerUpdates: [],
    },
  ],
  shareArgs: ["template1", "template2"],
  args: {
    input: "",
    template1: "",
    template2: "",
  },
  exec(args) {
    try {
      const keys = extractKeys(args.template1);
      const regex = buildCaptureRegex(args.template1);
      const match = args.input.match(regex);

      if (!args.input.trim() || !args.template1.trim() || !args.template2.trim()) {
        this.result = {
          text: '', error: null
        };
        return this.result;
      }

      if (!match || !match.groups) {
        throw new Error('Input does not match template1');
      }

      const params = {};
      for (const key of keys) {
        params[key] = match.groups[key] ?? '';
      }

      const prepared = prepareEscapes(args.template2);
      const output = prepared.replace(TOKEN_REGEX, (_, normalizedKey) => {
        if (!(normalizedKey in params)) {
          throw new Error(`Missing parameter: ${normalizedKey}`);
        }
        return String(params[normalizedKey]);
      });

      this.result = { text: restoreEscapes(output), error: null };
      return this.result;
    } catch (error) {
      this.result = { text: '', error: error.message };
      return this.result;
    }
  },
  result: { text: '', error: null },
}
