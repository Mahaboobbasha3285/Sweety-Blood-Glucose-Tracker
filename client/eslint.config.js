import globals from "globals";
import react from "eslint-plugin-react";

export default [
  { ignores: ["node_modules/**", "dist/**"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: { react },
    settings: { react: { version: "detect" } },
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^[A-Z_]" },
      ],
      "no-undef": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    },
  },
];
