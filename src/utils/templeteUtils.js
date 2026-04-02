const TOKEN_REGEX = /\{([^{}]+)\}/g;
const ESCAPED_OPEN = '__ESCAPED_OPEN_BRACE__';
const ESCAPED_CLOSE = '__ESCAPED_CLOSE_BRACE__';

export function prepareEscapes(template) {
  return template
    .replaceAll('{{', ESCAPED_OPEN)
    .replaceAll('}}', ESCAPED_CLOSE);
}

export function restoreEscapes(template) {
  return template
    .replaceAll(ESCAPED_OPEN, '{')
    .replaceAll(ESCAPED_CLOSE, '}');
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractKeys(template) {
  const prepared = prepareEscapes(template);
  const keys = [];

  for (const match of prepared.matchAll(TOKEN_REGEX)) {
    const key = match[1].trim();
    if (key && !keys.includes(key)) {
      keys.push(key);
    }
  }

  return keys;
}

export function buildCaptureRegex(template) {
  const prepared = prepareEscapes(template);
  let pattern = '^';
  let index = 0;

  for (const match of prepared.matchAll(TOKEN_REGEX)) {
    const full = match[0];
    const key = match[1].trim();
    const start = match.index ?? 0;

    pattern += escapeRegExp(prepared.slice(index, start));
    pattern += `(?<${key}>.*?)`;
    index = start + full.length;
  }

  pattern += escapeRegExp(prepared.slice(index));
  pattern += '$';

  return new RegExp(pattern);
}

export { TOKEN_REGEX };
