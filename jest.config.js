export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/integration-test/**/*.test.ts'],
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