// main jest configuration file
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '../..');

module.exports = {
  rootDir: BASE_DIR,
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/app/**/**.{js,jsx,mjs}',
  ],
  coverageReporters: [
    'clover',
    'text',
    'json',
    'json-summary',
  ],
  setupFilesAfterEnv: ['<rootDir>/config/jest/setup.js'],
  testEnvironment: 'jest-environment-jsdom-fourteen',
  testRegex: 'app.*__tests__.*.jsx?$',
  testURL: 'http://0.0.0.0',
  transform: {
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.s?css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
  ],
    '@/(.*)$': '<rootDir>/app/$1',
  moduleFileExtensions: [
    'web.js',
    'js',
    'json',
    'web.jsx',
    'jsx',
    'node',
    'mjs',
  ],
};
