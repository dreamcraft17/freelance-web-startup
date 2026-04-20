export type TranslateParams = Record<string, string | number>;

function readPath(messages: unknown, path: string[]): unknown {
  let cur: unknown = messages;
  for (const p of path) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function applyParams(template: string, params?: TranslateParams): string {
  if (!params) return template;
  let out = template;
  for (const [k, v] of Object.entries(params)) {
    out = out.split(`{{${k}}}`).join(String(v));
  }
  return out;
}

export type Translator = (key: string, params?: TranslateParams) => string;

export function createTranslator(messages: unknown): Translator {
  return function t(key: string, params?: TranslateParams): string {
    const raw = readPath(messages, key.split("."));
    if (typeof raw === "string") return applyParams(raw, params);
    if (process.env.NODE_ENV !== "production") {
      return `[missing:${key}]`;
    }
    return key;
  };
}
