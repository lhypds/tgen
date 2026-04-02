import { prepareEscapes, restoreEscapes, TOKEN_REGEX } from '../utils/templeteUtils';
import { buildObjectFromJson } from '../utils/jsonUtils';

export function function1(template, params_) {
  if (!template.trim()) {
    return 'Invalid.';
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

  return restoreEscapes(result);
}
