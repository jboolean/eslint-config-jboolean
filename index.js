module.exports = {
  "extends": [
    'eslint:recommended',
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "settings": {
  },
  "rules": {
    "no-var": "error",
    "prefer-const": "warn",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { "allowExpressions": true }
    ],
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": "warn"
  }
}
