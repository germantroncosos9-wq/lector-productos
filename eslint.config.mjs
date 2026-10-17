import js from "@eslint/js";
import globals from "globals";

/*
  Configuración de ESLint (flat config) para el JavaScript del proyecto.
  `js/app.js` es un script clásico cargado desde index.html; `sw.js` corre
  en el contexto del service worker.
*/
export default [
  {
    ignores: ["node_modules/**", "vendor/**"]
  },
  {
    files: ["js/app.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        /* Librería de escaneo (bundle UMD local) y API nativa opcional. */
        ZXingBrowser: "readonly",
        BarcodeDetector: "readonly"
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      /* Hay catch vacíos a propósito (p. ej. localStorage en modo privado). */
      "no-empty": ["error", { allowEmptyCatch: true }],
      /*
        El código usa `catch (e) {}` para ignorar errores de forma
        intencionada; no avisamos por el parámetro sin usar.
      */
      "no-unused-vars": ["error", { caughtErrors: "none" }]
    }
  },
  {
    files: ["sw.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.serviceworker,
        ...globals.browser
      }
    },
    rules: {
      ...js.configs.recommended.rules
    }
  }
];
