export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};