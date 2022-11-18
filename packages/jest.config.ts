import type { Config } from '@jest/types'

const packages: string[] = [
    'tactic-react',
    'tactic-engine',
    'tactic-vanilla',
]

const testMatchesLint: string[] = []

packages.forEach(pkg => {
    testMatchesLint.push(...[
        '<rootDir>/' + pkg + '/src/**/*.(js|ts|tsx)',
        //'<rootDir>/' + pkg + '/tests/**/*.(test|spec|d).(js|ts|tsx)',
    ])
})
const base: Partial<Config.InitialOptions> = {
    transformIgnorePatterns: [
        'node_modules/?!(@ui-controls)',
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.tsx$': 'ts-jest',
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^@ui-controls/progress(.*)$': '<rootDir>/ctrls-progress/src$1',
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
    collectCoverage: true,
    coveragePathIgnorePatterns: [
        '(tests/.*.mock).(jsx?|tsx?|ts?|js?)$',
    ],
    verbose: true,
}

const config: Config.InitialOptions = {
    ...base,
    projects: [
        ...packages.map(pkg => ({
            displayName: 'test-' + pkg,
            ...base,
            moduleDirectories: ['node_modules', '<rootDir>/' + pkg + '/node_modules'],
            testMatch: [
                '<rootDir>/' + pkg + '/src/**/*.(test|spec).(js|ts|tsx)',
                '<rootDir>/' + pkg + '/tests/**/*.(test|spec).(js|ts|tsx)',
            ],
        })),
        {
            displayName: 'lint',
            runner: 'jest-runner-eslint',
            ...base,
            testMatch: testMatchesLint,
            testPathIgnorePatterns: [
                // todo: enable linting test files again
                '(.*.mock).(jsx?|tsx?|ts?|js?)$',
                '(.*.test).(jsx?|tsx?|ts?|js?)$',
                '(.*.spec).(jsx?|tsx?|ts?|js?)$',
            ],
        },
    ],
    coverageDirectory: '<rootDir>/../coverage',
}

export default config
