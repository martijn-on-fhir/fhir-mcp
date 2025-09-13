import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
    eslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            // TypeScript specific rules
            '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/strict-boolean-expressions': 0,
            '@typescript-eslint/explicit-function-return-type': 2,
            '@typescript-eslint/restrict-template-expressions': 0,
            '@typescript-eslint/no-invalid-void-type': 0,
            '@typescript-eslint/dot-notation': 0,
            '@typescript-eslint/return-await': 0,
            '@typescript-eslint/space-before-function-paren': 0,

            // General code quality rules
            'no-console': 'off', // Allow console for server logging
            'no-unused-vars': 'off', // Use TypeScript version instead
            'prefer-const': 'error',
            'no-var': 'error',

            // Style rules
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'array-bracket-spacing': ['error', 'never'],
            'no-trailing-spaces': [2, {'skipBlankLines': true}],
            'no-multiple-empty-lines': [2, {
                'max': 1,
                'maxEOF': 1
            }],

            // FHIR/Healthcare specific
            'camelcase': ['error', {allow: ['^FHIR_', '^fhir_']}],
            'padded-blocks': [0, 'never'],
            'object-curly-spacing': [0, 'always'],
            'padding-line-between-statements': [
                'error',
                {
                    blankLine: 'always',
                    prev: '*',
                    next: 'block'
                },
                {
                    blankLine: 'always',
                    prev: 'block',
                    next: '*'
                },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: 'block-like'
                },
                {
                    blankLine: 'always',
                    prev: 'block-like',
                    next: '*'
                },
            ],
            '@typescript-eslint/naming-convention': [2,
                {
                    selector: 'variableLike',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow'
                },
                {
                    selector: 'classMethod',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow'
                },
                {
                    selector: 'classProperty',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow'
                },
                {
                    selector: 'class',
                    format: ['PascalCase'],
                    leadingUnderscore: 'allow'
                }
            ]
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
        },
        rules: {
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
        },
    },
    {
        files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                // Jest globals
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
                // Node.js globals for tests
                require: 'readonly',
                module: 'readonly',
                NodeJS: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            // Same TypeScript rules as main config but more relaxed for tests
            '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/strict-boolean-expressions': 0,
            '@typescript-eslint/explicit-function-return-type': 0, // Relaxed for tests
            '@typescript-eslint/restrict-template-expressions': 0,
            '@typescript-eslint/no-invalid-void-type': 0,
            '@typescript-eslint/dot-notation': 0,
            '@typescript-eslint/return-await': 0,
            '@typescript-eslint/space-before-function-paren': 0,

            // General code quality rules
            'no-console': 'off',
            'no-unused-vars': 'off',
            'prefer-const': 'error',
            'no-var': 'error',

            // Style rules - more relaxed for tests
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'array-bracket-spacing': ['error', 'never'],
            'no-trailing-spaces': [2, {'skipBlankLines': true}],
            'no-multiple-empty-lines': [2, {
                'max': 2, // More relaxed for tests
                'maxEOF': 1
            }],

            // More relaxed naming for tests
            'camelcase': 'off',
            'padded-blocks': 'off',
            'object-curly-spacing': 'off',
            'padding-line-between-statements': 'off',
            '@typescript-eslint/naming-convention': 'off',
        },
    },
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '*.config.js',
            'coverage/**',
        ],
    },
];