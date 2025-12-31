module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-refresh', 'security'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React Refresh
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // TypeScript
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/no-danger': 'error', // ป้องกันการใช้ dangerouslySetInnerHTML
    'react/no-danger-with-children': 'error', // ป้องกันการใช้ dangerouslySetInnerHTML กับ children
    'react/jsx-no-script-url': 'warn', // ป้องกัน javascript: URLs
    'react/jsx-no-target-blank': 'error', // ต้องมี rel="noopener noreferrer" ใน target="_blank"
    
    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Security Rules - General
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    
    // JSX A11y - Security related rules for forms and inputs
    'jsx-a11y/no-autofocus': 'warn', // autofocus อาจเป็นปัญหา security
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn', // ตรวจสอบว่า label ถูกเชื่อมกับ input (accessibility + security)
    'jsx-a11y/no-static-element-interactions': 'warn',
    
    // No innerHTML/document.write - ป้องกัน XSS
    'no-restricted-syntax': [
      'error',
      {
        selector: 'MemberExpression[object.name="document"][property.name="write"]',
        message: 'การใช้ document.write() อาจเป็นช่องโหว่ XSS ได้ ควรใช้ React rendering แทน',
      },
      {
        selector: 'MemberExpression[property.name="innerHTML"]',
        message: 'การใช้ innerHTML อาจเป็นช่องโหว่ XSS ได้ ควรใช้ textContent หรือ React props แทน',
      },
      {
        selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
        message: 'การใช้ dangerouslySetInnerHTML อาจเป็นช่องโหว่ XSS ได้ ควร sanitize HTML ก่อนใช้เสมอ',
      },
    ],
  },
}

