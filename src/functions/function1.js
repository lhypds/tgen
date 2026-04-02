import { prepareEscapes, restoreEscapes, TOKEN_REGEX } from '../utils/templeteUtils';
import { buildObjectFromJson } from '../utils/jsonUtils';

export function function1(template, params_) {
  try {
    if (!template.trim()) {
      return { text: 'Invalid.', error: null };
    }

    const params = buildObjectFromJson(params_ ?? '');

    const prepared = prepareEscapes(template);
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
