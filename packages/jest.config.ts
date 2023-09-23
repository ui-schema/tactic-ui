import type { Config } from '@jest/types'

const packages: [pkg: string, pkgDir?: string][] = [
    ['@tactic-ui/react', 'tactic-react'],
    ['@tactic-ui/engine', 'tactic-engine'],
    ['@tactic-ui/vanilla', 'tactic-vanilla'],
]

const testMatchesLint: string[] = []

packages.forEach(([pkg, pkgDir]) => {
    testMatchesLint.push(...[
        '<rootDir>/' + (pkgDir || pkg) + '/src/**/*.(js|ts|tsx)',
    ])
})
const base: Partial<Config.InitialOptions> = {
    transformIgnorePatterns: [
        'node_modules/?!(@tactic-ui)',
    ],
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        ...packages.reduce<{ [k: string]: string }>((moduleNameMapper, [pkg, pkgDir]) => ({
            ...moduleNameMapper,
            [`^${pkg}(.*)$`]: `<rootDir>/${pkgDir || pkg}/src$1`,
        }), {}),
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
    coveragePathIgnorePatterns: [
        '(tests/.*.mock).(jsx?|tsx?|ts?|js?)$',
    ],
}

const config: Config.InitialOptions = {
    ...base,
    projects: [
        ...packages.map(([pkg, pkgDir]) => ({
            displayName: 'test-' + pkg,
            ...base,
            transform: {
                '^.+\\.(jsx|ts|tsx)$': ['babel-jest', {rootMode: 'upward'}],
            } as any,
            moduleDirectories: [
                'node_modules',
                '<rootDir>/' + (pkgDir || pkg) + '/node_modules',
            ],
            testMatch: [
                '<rootDir>/' + (pkgDir || pkg) + '/src/**/*.(test|spec).(js|ts|tsx)',
                '<rootDir>/' + (pkgDir || pkg) + '/tests/**/*.(test|spec).(js|ts|tsx)',
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
