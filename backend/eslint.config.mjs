import tseslint from 'typescript-eslint';

export default tseslint.config(
   { ignores: ['dist/**', 'coverage/**', 'src/tests/**'] },
   {
      files: ['src/**/*.ts', 'scripts/**/*.ts', 'prisma/**/*.ts'],
      extends: [...tseslint.configs.recommended],
      rules: {
         '@typescript-eslint/no-explicit-any': 'off',
         '@typescript-eslint/no-namespace': 'off',
         '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
   },
);
