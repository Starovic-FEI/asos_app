module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './.babelrc' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
  },
};
