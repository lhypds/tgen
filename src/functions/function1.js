import { prepareEscapes, restoreEscapes, TOKEN_REGEX } from '../utils/templeteUtils';

export function function1(template, params) {
  if (!template.trim() || !params) {
    return 'Invalid.';
  }

  const prepared = prepareEscapes(template);
  const result = prepared.replace(TOKEN_REGEX, (_, key) => {
    const normalizedKey = key.trim();
    if (!(normalizedKey in params)) {
      throw new Error(`Missing parameter: ${normalizedKey}`);
    }
    return String(params[normalizedKey]);
  });

  return restoreEscapes(result);
}
