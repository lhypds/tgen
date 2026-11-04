// Placeholder syntax: {{key}} (whitespace inside is allowed: {{ key }}).
// Keys must be identifier-like (letters, digits, _ and $, not starting with a digit),
// so JSON braces such as {"a": {"b": 1}} are never treated as placeholders.
// Use \{{ to output a literal "{{".
const TOKEN_REGEX = /\{\{\s*([\p{L}_$][\p{L}\p{N}_$]*)\s*\}\}/gu;
const ESCAPED_OPEN = '\u0000ESCAPED_OPEN\u0000';

export function prepareEscapes(template) {
  return template.replaceAll('\\{{', ESCAPED_OPEN);
}

export function restoreEscapes(template) {
  return template.replaceAll(ESCAPED_OPEN, '{{');
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractKeys(template) {
  const prepared = prepareEscapes(template);
  const keys = [];

  for (const match of prepared.matchAll(TOKEN_REGEX)) {
    const key = match[1];
    if (!keys.includes(key)) {
      keys.push(key);
    }
  }

  return keys;
}

export function buildCaptureRegex(template) {
  const prepared = prepareEscapes(template);
  const seen = new Set();
  let pattern = '^';
  let index = 0;

  for (const match of prepared.matchAll(TOKEN_REGEX)) {
    const full = match[0];
    const key = match[1];
    const start = match.index ?? 0;

    pattern += escapeRegExp(restoreEscapes(prepared.slice(index, start)));
    // A repeated key must match the same text as its first occurrence.
    pattern += seen.has(key) ? `\\k<${key}>` : `(?<${key}>.*?)`;
    seen.add(key);
    index = start + full.length;
  }

  pattern += escapeRegExp(restoreEscapes(prepared.slice(index)));
  pattern += '$';

  return new RegExp(pattern, 'su');
}

export { TOKEN_REGEX };
