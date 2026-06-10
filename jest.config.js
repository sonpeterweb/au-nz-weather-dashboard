// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],

  testEnvironment: 'jest-environment-jsdom',

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
  ],

  collectCoverageFrom: [
    'src/lib/chart-utils.ts',
    'src/lib/dashboard-params.ts',
    'src/lib/locations.ts',
    'src/lib/open-meteo.ts',
    'src/lib/schema.ts',
    'src/lib/theme.ts',
    'src/lib/utils.ts',
    'src/app/api/weather/**/*.{ts,tsx}',
    'src/components/AlertBadge.tsx',
    'src/components/ErrorMessage.tsx',
    'src/components/FilterBar.tsx',
    'src/components/KpiCards.tsx',
    'src/components/RoleToggle.tsx',
    'src/components/ThemeToggle.tsx',
    'src/components/Skeleton.tsx',
    'src/components/DashboardSkeletons.tsx',
    'src/components/charts/**/*.{ts,tsx}',
    'src/hooks/useDashboardSearchParams.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.mock.{ts,tsx}',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  /**
   * Absolute imports and Module Path Aliases
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/public/$1',
    '^.+\\.(svg)$': '<rootDir>/src/__mocks__/svg.tsx',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
