module.exports = {
  preset: 'ts-jest',
  collectCoverage: false,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/public/**",
    "!**/es/**",
    "!**/driver/**",
    "!**/domain/**",
    "!**/app/**",
    "!**/middleware/**",
    "!**/api/index.ts",
    "!**/worker/*",
    "!**/worker/job/*",
    "!**/service/SimulateNats.ts",
    "!**/__tests__/**",
  ],
  coverageReporters: ["json", "lcov", "text", "clover", "html"],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
  coverageDirectory: "./coverage",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: [
    "**/__tests__/**/*(spec|test).[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
};
