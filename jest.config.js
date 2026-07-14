module.exports = {
  testEnvironment: 'node',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }],
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js'],
};
