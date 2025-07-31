import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Add ecosystem.config.js to ignores
    ignores: ["eslint.config.mjs", "ecosystem.config.js", "dist", "node_modules", "src/types/supabase.types.ts"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {      // -------- “any”‑related safety nets --------
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-argument": "off",
      // -------- Promise‑related safety nets --------
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
);
