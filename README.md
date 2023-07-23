<h1 align="center">Tactic-UI</h1>

[![Github actions Build](https://github.com/ui-schema/tactic-ui/actions/workflows/blank.yml/badge.svg)](https://github.com/ui-schema/tactic-ui/actions)
[![react compatibility](https://img.shields.io/badge/React-%3E%3D17-success?style=flat-square&logo=react)](https://reactjs.org/)
[![MIT license](https://img.shields.io/npm/l/@ui-controls/progress?style=flat-square)](https://github.com/ui-schema/tactic-ui/blob/main/LICENSE)
![Typed](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)

Render engine for AST & Widget systems - bring your own UI and data-spec - strongly typed.

> ⚗ Experimental architecture for UIS core replacement of `PluginStack`/`WidgetEngine`

- ⚗ @tactic-ui/react [![npm (scoped)](https://img.shields.io/npm/v/@tactic-ui/react?style=flat-square)](https://www.npmjs.com/package/@tactic-ui/react)
- ⚗ @tactic-ui/engine [![npm (scoped)](https://img.shields.io/npm/v/@tactic-ui/engine?style=flat-square)](https://www.npmjs.com/package/@tactic-ui/engine)
- 🚧 ~~@tactic-ui/vanilla~~ [![npm (scoped)](https://img.shields.io/npm/v/@tactic-ui/vanilla?style=flat-square)](https://www.npmjs.com/package/@tactic-ui/vanilla)

## ReactJS

```shell
npm i @tactic-ui/react
```

- [DEV Demo: static / automatic rendering](./packages/tactic-react/demo/src/pages/PageDemoDecoratorBasic.tsx)
- [DEV Demo: pure-TS `Deco` usage](./packages/tactic-react/demo/src/demoDeco.ts)

## JS / Vanilla

> todo: a small runtime for server and web to render leafs

```shell
npm i @tactic-ui/vanilla
```

### Browser

> todo

### NodeJS

> todo

## Engine

~~Provides the `Deco` implementation~~, otherwise contains only the basic typings for leafs and mappings.

> not needed to install additionally, this module is included and re-exported from `@tactic-ui/react`

> ⚠️⚠️ [ESM only package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) (atm., maybe forever)

```shell
npm i -S @tactic-ui/engine
```

## Versions

This project adheres to [semver](https://semver.org/), until `1.0.0` and beginning with `0.1.0`: all `0.x.0` releases are like MAJOR releases and all `0.0.x` like MINOR or PATCH, modules below `0.1.0` should be considered experimental.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is free software distributed under the **MIT License**.

See: [LICENSE](LICENSE).

© 2022 [bemit UG (haftungsbeschränkt)](https://bemit.codes)

***

Created by [Michael Becker](https://i-am-digital.eu)
