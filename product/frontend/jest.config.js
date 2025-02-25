/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "node"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Maps @/ to src/
  },
};
