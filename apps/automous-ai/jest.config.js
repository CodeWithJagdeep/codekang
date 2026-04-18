/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: "./tsconfig.test.json",
    }],
  },
  moduleFileExtensions: ["js", "json", "ts"],
  roots: ["<rootDir>/src"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  coverageDirectory: "./coverage",
};
