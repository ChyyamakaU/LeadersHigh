module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  maxWorkers: 1,
  setupFiles: ["./tests/setup.js"],
  setupFilesAfterEnv: ["./tests/teardown.js"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/models/index.js",
    "!src/config/**",
    "!tests/**",
  ],
  coverageDirectory: "./coverage",
  verbose: true,
};
