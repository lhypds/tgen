import { f1 } from './f1';
import { buildCaptureRegex, extractKeys } from '../utils/templeteUtils';

export function f2(input, template1, template2) {
  const keys = extractKeys(template1);
  const regex = buildCaptureRegex(template1);
  const match = input.match(regex);

  if (!input.trim() || !template1.trim() || !template2.trim()) {
    return 'Invalid.';
  }

  if (!match || !match.groups) {
    throw new Error('Input does not match template1');
  }

  const params = {};
  for (const key of keys) {
    params[key] = match.groups[key] ?? '';
  }

  return f1(template2, params);
}
