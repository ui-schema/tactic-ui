import path, {dirname} from 'path'
import {packer, webpack} from 'lerna-packer'
import {makeModulePackageJson, copyRootPackageJson, transformForEsModule} from 'lerna-packer/packer/modulePackages.js'
import fs from 'fs'
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url))

packer({
    apps: {
        tacticReactDemo: {
            root: path.resolve(__dirname, 'packages', 'tactic-react'),
            rootSrc: 'demo/src',
            template: path.resolve(__dirname, 'packages', 'tactic-react/demo/public/index.html'),
            contentBase: path.resolve(__dirname, 'packages', 'tactic-react/demo/public'),
            port: 4230,
            main: path.resolve(__dirname, 'packages', 'tactic-react/demo/src/index.tsx'),
            dist: path.resolve(__dirname, 'dist', 'tactic-react-demo'),
            devServer: {
                client: {
                    overlay: false,
                    progress: false,
                },
            },
            publicPath: '/',
        },
    },
    backends: {},
    packages: {
        tacticReact: {
            name: '@tactic-ui/react',
            doServeWatch: true,
            esmOnly: true,
            babelTargets: [
                {distSuffix: '', args: ['--no-comments', '--extensions', '.ts', '--extensions', '.tsx', '--extensions', '.js', '--ignore', '**/*.d.ts']},
            ],
            root: path.resolve(__dirname, 'packages', 'tactic-react'),
            entry: path.resolve(__dirname, 'packages', 'tactic-react/src/'),
        },
        tacticEngine: {
            name: '@tactic-ui/engine',
            doServeWatch: true,
            esmOnly: true,
            babelTargets: [
                {distSuffix: '', args: ['--no-comments', '--extensions', '.ts', '--extensions', '.js', '--ignore', '**/*.d.ts']},
            ],
            root: path.resolve(__dirname, 'packages', 'tactic-engine'),
            entry: path.resolve(__dirname, 'packages', 'tactic-engine/src/'),
        },
        tacticVanilla: {
            name: '@tactic-ui/vanilla',
            doServeWatch: true,
            esmOnly: true,
            babelTargets: [
                {distSuffix: '', args: ['--no-comments', '--extensions', '.ts', '--extensions', '.js', '--ignore', '**/*.d.ts']},
            ],
            root: path.resolve(__dirname, 'packages', 'tactic-vanilla'),
            entry: path.resolve(__dirname, 'packages', 'tactic-vanilla/src/'),
        },
    },
}, __dirname, {
    afterEsModules: (packages, pathBuild, isServing) => {
        return Promise.all([
            makeModulePackageJson(transformForEsModule)(
                Object.keys(packages).reduce(
                    (packagesFiltered, pack) =>
                        packages[pack].esmOnly ? packagesFiltered : {...packagesFiltered, [pack]: packages[pack]},
                    {},
                ),
                pathBuild,
            ),
            ...(isServing ? [] : [copyRootPackageJson()(packages, pathBuild)]),
        ]).then(() => undefined).catch((e) => {
            console.error('ERROR after-es-mod', e)
            return Promise.reject(e)
        })
    },
})
    .then(([execs, elapsed]) => {
        if(execs.indexOf('doServe') !== -1) {
            console.log('[packer] is now serving (after ' + elapsed + 'ms)')
        } else {
            if(execs.indexOf('doBuild') !== -1) {
                const nodePackages = [
                    // todo: improve pkg config availability here, when staying with lerna
                    // [path, esmOnly]
                    [path.resolve(__dirname, 'packages', 'tactic-engine'), true],
                    [path.resolve(__dirname, 'packages', 'tactic-react'), true],
                    [path.resolve(__dirname, 'packages', 'tactic-vanilla'), true],
                ]

                const saver = nodePackages.map(([pkg, esmOnly]) => {
                    return new Promise(((resolve, reject) => {
                        console.log(' rewrite package.json of ' + pkg)
                        const packageFile = JSON.parse(fs.readFileSync(path.join(pkg, 'package.json')).toString())
                        // todo: for backends: here check all `devPackages` etc. an replace local-packages with `file:` references,
                        //       then copy the `build` of that package to e.g. `_modules` in the backend `build`
                        if(packageFile.exports) {
                            packageFile.exports = Object.keys(packageFile.exports).reduce((exp, pkgName) => {
                                let pkgExportsFinal
                                const pkgExports = packageFile.exports[pkgName]
                                const changeFolder = (maybePrefixedFolder) =>
                                    maybePrefixedFolder.startsWith('./build/') ?
                                        '.' + maybePrefixedFolder.slice('./build'.length) :
                                        maybePrefixedFolder.startsWith('./src/') ?
                                            '.' + maybePrefixedFolder.slice('./src'.length) :
                                            maybePrefixedFolder
                                if(typeof pkgExports === 'string') {
                                    pkgExportsFinal = changeFolder(pkgExports)
                                } else if(typeof pkgExports === 'object') {
                                    pkgExportsFinal = Object.keys(pkgExports).reduce((pkgExportsNext, pkgExport) => {
                                        let pkgExportNext = changeFolder(pkgExports[pkgExport])
                                        let cjs = undefined
                                        if(pkgExport === 'import' && !esmOnly) {
                                            if(!pkgExport['require']) {
                                                cjs = {'require': pkgExportNext}
                                            }
                                            pkgExportNext = pkgExportNext.startsWith('./esm/') ? pkgExportNext : './esm' + pkgExportNext.slice(1)
                                        }
                                        return {
                                            ...pkgExportsNext,
                                            [pkgExport]:
                                                pkgExportNext.endsWith('.ts') && !pkgExportNext.endsWith('.d.ts') ?
                                                    pkgExportNext.slice(0, -3) + '.d.ts' : pkgExportNext,
                                            ...cjs || {},
                                        }
                                    }, {})
                                } else {
                                    throw new Error(`package exports could not be generated for ${pkgName}`)
                                }
                                return {
                                    ...exp,
                                    [pkgName]: pkgExportsFinal,
                                }
                            }, packageFile.exports)
                        }
                        if(packageFile.module && packageFile.module.startsWith('build/')) {
                            packageFile.module = packageFile.module.slice('build/'.length)
                        }
                        if(packageFile.module && packageFile.module.startsWith('src/')) {
                            packageFile.module = packageFile.module.slice('src/'.length)
                        }
                        if(packageFile.main && packageFile.main.startsWith('build/')) {
                            packageFile.main = packageFile.main.slice('build/'.length)
                        }
                        if(packageFile.main && packageFile.main.startsWith('src/')) {
                            packageFile.main = packageFile.main.slice('src/'.length)
                        }
                        if(packageFile.typings && packageFile.typings.startsWith('build/')) {
                            packageFile.typings = packageFile.typings.slice('build/'.length)
                        }
                        if(packageFile.typings && packageFile.typings.startsWith('src/')) {
                            packageFile.typings = packageFile.typings.slice('src/'.length)
                        }
                        if(packageFile.types && packageFile.types.startsWith('build/')) {
                            packageFile.types = packageFile.types.slice('build/'.length)
                        }
                        if(packageFile.types && packageFile.types.startsWith('src/')) {
                            packageFile.types = packageFile.types.slice('src/'.length)
                        }
                        fs.writeFile(path.join(pkg, 'build', 'package.json'), JSON.stringify(packageFile, null, 4), (err) => {
                            if(err) {
                                reject(err)
                                return
                            }
                            resolve()
                        })
                    }))
                })
                Promise.all(saver)
                    .then(() => {
                        console.log('[packer] finished successfully (after ' + elapsed + 'ms)', execs)
                        process.exit(0)
                    })
                    .catch((e) => {
                        console.error('packerConfig', e)
                    })
            } else {
                console.log('[packer] finished successfully (after ' + elapsed + 'ms)', execs)
                process.exit(0)
            }
        }
    })
    .catch((e) => {
        console.error('[packer] finished with error(s)', e)
        process.exit(1)
    })

