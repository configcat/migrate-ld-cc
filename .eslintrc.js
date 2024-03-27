module.exports = {
    root: true,
    env: {
        node: true,
        es2024: true,
    },
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
    },
    plugins: ['prettier', 'import'],
    extends: ['eslint:recommended'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                printWidth: 100,
                singleQuote: true,
                trailingComma: 'es5',
                tabWidth: 4,
            },
        ],
        'import/order': ['error'],
        'no-useless-escape': 'off',
        'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
    },
};
