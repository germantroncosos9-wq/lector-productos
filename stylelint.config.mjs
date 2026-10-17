/** @type {import("stylelint").Config} */
export default {
  rules: {
    "at-rule-no-unknown": true,
    "block-no-empty": true,
    "color-no-invalid-hex": true,
    "comment-no-empty": true,
    "declaration-block-no-duplicate-properties": [
      true,
      { ignore: ["consecutive-duplicates-with-different-values"] }
    ],
    "declaration-block-no-shorthand-property-overrides": true,
    "font-family-no-duplicate-names": true,
    "function-calc-no-unspaced-operator": true,
    "function-linear-gradient-no-nonstandard-direction": true,
    "keyframe-declaration-no-important": true,
    "media-feature-name-no-unknown": true,
    "named-grid-areas-no-invalid": true,
    "no-duplicate-at-import-rules": true,
    /*
      Desactivada a propósito: el CSS conserva selectores repetidos en
      secciones "de parches" posteriores que sobrescriben de forma
      intencional. Unir esas reglas rompería la cascada (ver las notas de
      la Fase 4.1 del plan de mejoras).
    */
    "no-duplicate-selectors": null,
    "no-empty-source": true,
    "no-invalid-double-slash-comments": true,
    "no-invalid-position-at-import-rule": true,
    "no-irregular-whitespace": true,
    "property-no-unknown": true,
    "selector-pseudo-class-no-unknown": true,
    "selector-pseudo-element-no-unknown": true,
    "selector-type-no-unknown": true,
    "string-no-newline": true,
    "unit-no-unknown": true
  }
};
