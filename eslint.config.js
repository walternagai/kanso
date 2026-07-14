// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/", "node_modules/", ".test-*/", "coverage/"],
  },
  {
    rules: {
      // Permitir console.log nos arquivos de tema (CLI output intencional)
      "no-console": "off",
      // Prefer const sobre let quando possível
      "prefer-const": "warn",
      // Evitar variáveis não utilizadas (prefixo _ permite)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
