// main jest configuration file
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '../..');

module.exports = {
  rootDir: BASE_DIR,
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/app/**/**.{js,jsx,ts,tsx,mjs}',
  ],
  coverageReporters: [
    'clover',
    'text',
    'json',
    'json-summary',
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/coverage',
        outputName: 'junit.xml',
      },
    ],
  ],
  setupFilesAfterEnv: ['<rootDir>/config/jest/setup.js'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://0.0.0.0',
  },
  testRegex: 'app.*__tests__.*.test.[jt]sx?$',
  transform: {
    '^.+\\.([jt]sx?)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.s?css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.([jt]sx?|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!@mui).+(jsx?)$',
  ],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/app/$1',
  },
  moduleFileExtensions: [
    'web.js',
    'js',
    'json',
    'web.jsx',
    'jsx',
    'node',
    'mjs',
    'ts',
    'tsx',
    'd.ts',
  ],
  setupFiles: [
    '<rootDir>/config/jest/windowEnvMock.js',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
