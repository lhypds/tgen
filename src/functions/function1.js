import { prepareEscapes, restoreEscapes, TOKEN_REGEX } from '../utils/templeteUtils';
import { buildObjectFromJson } from '../utils/jsonUtils';

export function function1(args) {
  try {
    if (!args.template.trim()) {
      return { text: 'Invalid.', error: null };
    }

    const params = buildObjectFromJson(args.params_ ?? '');

    const prepared = prepareEscapes(args.template);
    const result = prepared.replace(TOKEN_REGEX, (_, key) => {
      const normalizedKey = key.trim();
      if (!(normalizedKey in params)) {
        throw new Error(`Missing parameter: ${normalizedKey}`);
      }
      return String(params[normalizedKey]);
    });

    return { text: restoreEscapes(result), error: null };
  } catch (error) {
    return { text: '', error: error.message };
  }
}
