import { buildCaptureRegex, extractKeys, prepareEscapes, restoreEscapes, TOKEN_REGEX } from '../utils/templeteUtils';

export function function2(args) {
  try {
    const keys = extractKeys(args.template1);
    const regex = buildCaptureRegex(args.template1);
    const match = args.input.match(regex);

    if (!args.input.trim() || !args.template1.trim() || !args.template2.trim()) {
      return { text: 'Invalid.', error: null };
    }

    if (!match || !match.groups) {
      throw new Error('Input does not match template1');
    }

    const params = {};
    for (const key of keys) {
      params[key] = match.groups[key] ?? '';
    }

    const prepared = prepareEscapes(args.template2);
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
