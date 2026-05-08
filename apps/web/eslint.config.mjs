import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname
});

/** ESLint 9 flat config — avoids interactive `next lint` setup prompts in CI. */
export default [...compat.extends("next/core-web-vitals")];
