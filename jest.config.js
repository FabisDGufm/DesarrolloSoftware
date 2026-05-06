export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/unit-test/**/*.test.ts', '**/tests/unit-tests/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  clearMocks: true,
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@prisma)/)',
  ],
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
};