module.exports = {
  "extends": [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": [
    "react",
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "react/no-typos": "warn",
    "react/jsx-handler-names": "warn",
    "react/jsx-pascal-case": "warn"
  }
}
