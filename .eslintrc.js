module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "react"],
    extends: [
        "plugin:@typescript-eslint/recommended",
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    env: {
        "es6": true,
        browser: true,
        node: true,
    },
    rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/prefer-interface": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/array-type": "off",
        "no-console": "off",
        "no-debugger": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "react-hooks/exhaustive-deps": "off",
        "react/prop-types": "off",
        "prefer-template": 2
    }
};
