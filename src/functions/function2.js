import { function1 } from './function1';
import { buildCaptureRegex, extractKeys } from '../utils/templeteUtils';

export function function2(input, template1, template2) {
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

  return function1(template2, params);
}
