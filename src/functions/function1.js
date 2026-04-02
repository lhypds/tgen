import { prepareEscapes, restoreEscapes, TOKEN_REGEX } from '../utils/templeteUtils';
import { buildObjectFromJson } from '../utils/jsonUtils';

export const function1 = {
  name: "function1",
  title: "Function1",
  description: "Provide a string template with {} and text. Generate a string by replacing the {} with the corresponding values from the parameters.",
  fields: [
    {
      key: "template",
      label: "Template",
      type: "text",
      from: "user",
      rows: 4,
      placeholder: "Today's weather is {weather}.",
    },
    {
      key: "input",
      label: "Input JSON",
      type: "json",
      from: "template",
      rows: 8,
      placeholder: '{\n  "weather": "sunny"\n}',
    },
  ],
  templateArgs: {
    template: "",
  },
  args: {
    template: "",
    input: "",
  },
  exec(args) {
    try {
      if (!args.template.trim()) {
        this.result = { text: 'Invalid.', error: null };
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
