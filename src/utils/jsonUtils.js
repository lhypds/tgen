export function buildObjectFromJson(jsonText) {
  if (!jsonText.trim()) {
    return {};
  }

  const parsed = JSON.parse(jsonText);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('JSON object expected.');
  }
  return parsed;
}
