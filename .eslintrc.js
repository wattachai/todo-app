module.exports = {
  "env": {
    "node": true,
    "es6": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "semi": [
      1,
      "always"
    ],
    "no-console": [
      0
    ],
    "no-unused-vars": [
      1,
      {
        "args": "none",
        "vars": "local"
      }
    ],
    "eqeqeq": [
      2,
      "always"
    ]
  }
};
