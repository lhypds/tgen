import { prepareEscapes, restoreEscapes, TOKEN_REGEX } from '@utils/templeteUtils';
import { buildObjectFromJson } from '@utils/jsonUtils';

export const function1 = {
  name: "function1",
  title: "Replacer",
  description: "Provide a string template with {{key}} placeholders. Generate a string by replacing each {{key}} with the corresponding values from the parameters.",
  layout: "column",  // fields stacked top to bottom
  brain: { field: "template", valuesField: "input" },  // AI turns template values into {{key}} placeholders
  fields: [
    {
      key: "template",
      label: "Template",
      type: "text",
      minHeight: 180,
      placeholder: "Today's weather is {{weather}}.",
      triggerUpdates: [
        {
          "field": "input",
          "method": 'extract_keys',  // trigger input update when template changes
        }
      ]
    },
    {
      key: "input",
      label: "Input",
      type: "params",  // key value list or JSON
      minHeight: 120,
      emptyText: "Add {{key}} placeholders to the template",
      placeholder: '{\n  "weather": "sunny"\n}',
      triggerUpdates: [],
    },
  ],
  shareArgs: ["template"],  // for creating shareable functions
  args: {
    template: "",
    input: "",
  },
  exec(args) {
    try {
      if (!args.template.trim()) {
        this.result = { text: '', error: null };
        return this.result;
      }

      // Params in string {{}}
      const params = buildObjectFromJson(args.input ?? '');

      const prepared = prepareEscapes(args.template);
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
