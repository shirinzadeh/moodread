import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import vueParser from 'vue-eslint-parser';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: typescriptParser,
				extraFileExtensions: ['.vue'],
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		plugins: {
			'@typescript-eslint': typescriptPlugin,
		},
		rules: {
			'no-console': 'off',
			'vue/max-attributes-per-line': ['error', {
				singleline: {
					max: 2,
				},
				multiline: {
					max: 1,
				},
			}],
			'vue/first-attribute-linebreak': ['error', {
				singleline: 'beside',
				multiline: 'below',
			}],
			'vue/multiline-html-element-content-newline': ['error', {
				ignoreWhenEmpty: true,
				ignores: ['pre', 'textarea'],
				allowEmptyLines: false,
			}],
			'vue/html-closing-bracket-newline': ['error', {
				singleline: 'never',
				multiline: 'always',
			}],
			'vue/html-indent': ['error', 'tab', {
				attribute: 1,
				baseIndent: 1,
				closeBracket: 0,
				alignAttributesVertically: true,
				ignores: [],
			}],
			'indent': ['error', 'tab'],
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		plugins: {
			'@typescript-eslint': typescriptPlugin,
		},
		rules: {
			'no-console': 'off',
			'indent': ['error', 'tab'],
		},
	},
);
