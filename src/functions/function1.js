import { prepareEscapes, restoreEscapes, TOKEN_REGEX } from '../utils/templeteUtils';
import { buildObjectFromJson } from '../utils/jsonUtils';

export const function1 = {
  name: "function1",
  title: "Replacer",
  description: "Provide a string template with {} and text. Generate a string by replacing the {} with the corresponding values from the parameters.",
  fields: [
    {
      key: "template",
      label: "Template",
      type: "text",
      rows: 6,
      placeholder: "Today's weather is {weather}.",
      triggerUpdates: [
        {
          "field": "input",
          "method": 'extract_keys',  // trigger input update when template changes
        }
      ]
    },
    {
      key: "input",
      label: "Input JSON",
      type: "json",
      rows: 10,
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

      // Params in string {}
      const params = buildObjectFromJson(args.input ?? '');

      const prepared = prepareEscapes(args.template);
      const output = prepared.replace(TOKEN_REGEX, (_, key) => {
        const normalizedKey = key.trim();
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
