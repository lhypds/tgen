function normalizeFunctionName(value) {
  const normalized = (value ?? "").toLowerCase();
  if (normalized === "function1" || normalized === "f1") {
    return "function1";
  }
  if (normalized === "function2" || normalized === "f2") {
    return "function2";
  }
  return null;
}

export function parseFunctionQuery(search) {
  const query = new URLSearchParams(search);
  const result = {
    function: normalizeFunctionName(query.get("function")),
    f1: {},
    f2: {},
  };

  if (result.function === "function1") {
    result.f1.templete = query.get("templete") ?? query.get("template") ?? "";
    result.f1.input = query.get("input") ?? "";
    return result;
  }

  if (result.function === "function2") {
    result.f2.input = query.get("input") ?? "";
    result.f2.templete1 = query.get("templete1") ?? query.get("template1") ?? "";
    result.f2.templete2 = query.get("templete2") ?? query.get("template2") ?? "";
    return result;
  }

  for (const [fullKey, value] of query.entries()) {
    const parsed = fullKey.match(/^(f\d+)_(.+)$/i);
    if (!parsed) {
      continue;
    }

    const fn = parsed[1].toLowerCase();
    const keyPart = parsed[2].toLowerCase();

    const argMatch = keyPart.match(/^arg(\d+)$/);
    if (argMatch) {
      const argNumber = Number(argMatch[1]);
      if (fn === "f1" && argNumber === 1) {
        result.f1.templete = value;
      }
      if (fn === "f2" && argNumber === 1) {
        result.f2.input = value;
      }
      if (fn === "f2" && argNumber === 2) {
        result.f2.templete1 = value;
      }
      if (fn === "f2" && argNumber === 3) {
        result.f2.templete2 = value;
      }
    } else {
      if (fn === "f1" && keyPart === "input") {
        result.f1.input = value;
      }
      if (fn === "f2" && keyPart === "input") {
        result.f2.input = value;
      }
    }
  }

  return result;
}
