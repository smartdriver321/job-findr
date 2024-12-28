// import globals from 'globals'
// import pluginJs from '@eslint/js'

// /** @type {import('eslint').Linter.Config[]} */
// export default [
// 	{ languageOptions: { globals: globals.browser } },
// 	pluginJs.configs.recommended,
// ]

//////////////////////////////////////////////////////
import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginReact from 'eslint-plugin-react'
import pluginImport from 'eslint-plugin-import'

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		languageOptions: {
			globals: globals.browser,
		},
		plugins: {
			react: pluginReact,
			import: pluginImport,
		},
		rules: {
			'react/react-in-jsx-scope': 'off',
			'import/no-unresolved': 'error',
			ignoreDuringBuilds: 'true',
		},
	},
	pluginJs.configs.recommended,
]
