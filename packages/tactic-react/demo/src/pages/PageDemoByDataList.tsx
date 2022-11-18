import React from 'react'
import {
    createLeafsContext, defineLeafsProvider,
    LeafsRenderMapping, TreeEngine,
    ReactLeafsRenderMatcher, ReactLeafsNodeSpec,
} from '@tactic-ui/react/LeafsProvider'
import { defineLeafNode, LeafNode } from '@tactic-ui/react/LeafNode'
import { Deco, DecoDataPluck, DecoDataResult } from '@tactic-ui/react/Deco'
import { Typo } from '../components/Styles'

// 👉 1. Define two types which will be used as base for props of all leafs
//    - one base typing: used for every other typing
//    - one base-props typing: based upon the first base and used for every `Leaf` to build the `props` automatically
//    - this must contain the meta data, like the properties which are used for "matching"
//    - for LeafEngines which provide data-bindings it should also contain e.g. `storeKeys` / `storePath` / `entityName`+`entityId`
//    - for strict typing mapping inside of the `Leaf`, add one generic param, which can be used for equality check,
//      the value must equal a `key` of `CustomLeafDataSpec`
export interface CustomLeafDataType<T extends string> {// todo: maybe `extends keyof any` instead of just `extends string`
    type: T
}

export interface CustomLeafPropsWithValue<V extends CustomLeafDataType<string>> {
    type: V['type']
    storePath: string
    value: V
}

// 👉 2. Define further types which are specific to only some mappings
export interface CustomLeafDataOfContent {
    content: string
}

// 👉 3. Define a mapping of which "leaf type" should use which `LeafData` as specific values object
export interface CustomLeafDataSpec {
    // todo: maybe switch definition: first Deco, second Data/Props Specs -> reusing `Deco` for applying the plugin typing
    headline: CustomLeafDataType<'headline'> & CustomLeafDataOfContent
    paragraph: CustomLeafDataType<'paragraph'> & CustomLeafDataOfContent
    breakThematic: CustomLeafDataType<'breakThematic'>

    // this doesn't work together with non-compatible types, can't be typed "loose" without all to be "loose"
    // [k: string]: LeafData<string> & { content: string | number }
}

// 👉 4. Define a React Component type which maps the data mappings (which are now also props mappings)
//    - note: this will make something like: `(CustomLeafPropsSpec['headline'] | CustomLeafPropsSpec['paragraph'] | CustomLeafPropsSpec['breakThematic'])`

export type CustomLeafPropsSpec = {
    [NT in keyof CustomLeafDataSpec]:
    {
        dense?: boolean
        // `valid as number` lets TS at rendering fail when in conflict with deco.RG
        // valid?: number
    } & CustomLeafPropsWithValue<CustomLeafDataSpec[NT]>
}

// 👉 5. Define the `Deco` / decorators, this is executed from within `LeafNode`,
//    e.g. use it as a way to add props based plugins which are not React components

export interface DecoTW {
    storePath: string
    dummy?: null
}

// todo: `Deco` must receive "props without those which Deco injects", so maybe two `PropsSpec` mappings? or data? or ...?
//       e.g. impacts "required by component and injected by decorator" together with `LeafNode`/`DataPluck` typings: not removing the required `props` from `Deco.PG`
//       note: using only `DecoTW` would work correctly for user etc. BUT impacts the `decorator.run` input-typing
// const dec = new Deco<DecoTW>()
const dec = new Deco<DecoTW & CustomLeafPropsSpec[keyof CustomLeafPropsSpec]>()
    .use(<P extends DecoTW>(p: P): DecoTW & { required: boolean } => ({...p, required: true}))
    .use(<P extends DecoTW & { required?: boolean }>(p: P): DecoTW & { valid: boolean } => ({...p, valid: false}))
// .use(<P extends DecoTW>(p: P): DecoTW & { valid: boolean } => ({...p, valid: false}))

// this typing is `props` of the `LeafNode` rendering, use e.g. when defining data previously;
// contains own data-typing AND required by decorators
export type DecoDataPl = DecoDataPluck<CustomLeafPropsSpec[keyof CustomLeafPropsSpec], typeof dec>
// this typing is `props` of the `Leaf` -> your component
// contains own data-typing AND what is added by decorators
// todo: not tested yet for decorators: "remove some existing prop from typing"
export type DecoDataRe<S extends keyof CustomLeafPropsSpec> = DecoDataResult<CustomLeafPropsSpec[S], typeof dec>

// todo: when using the node spec here, the problem with generic-generics is solvable?! and allows crystal clear widget typing on receiving props?
export type CustomLeafsNodeSpec = ReactLeafsNodeSpec<CustomLeafPropsSpec, typeof dec>

// 👉 6. Map the actual `Leaf` implementations

const BreakThematic: React.FC<DecoDataRe<'breakThematic'>> =
    (props) => <hr title={props.storePath} style={{width: '100%'}}/>

const leafs: CustomLeafsNodeSpec = {
    headline: (props) => props.value.type === 'headline' ? <Typo component={'h3'} title={props.storePath}>{props.value.content || null}</Typo> : null,
    paragraph: (props) => props.value.type === 'paragraph' ? <Typo component={'p'} title={props.storePath}>{props.value.content || null}</Typo> : null,
    breakThematic: BreakThematic,
}

// - optional "hard coded" components mapping for e.g. replaceable `Grid`/`NoLeaf` components
export type CustomLeafComponents = {}

export const customRenderMapping: LeafsRenderMapping<CustomLeafsNodeSpec, CustomLeafComponents> = {
    leafs: leafs,
    components: {},
}

// 👉 7. Define the LeafEngine, with the specific matcher and what the active decorator

const engine: TreeEngine<CustomLeafPropsSpec, typeof dec, ReactLeafsRenderMatcher<typeof dec, CustomLeafPropsSpec, CustomLeafComponents>> = {
    decorator: dec,
    matcher: (leafs, ld) => {
        // const valid = 'valid' in ld ? ld.valid : undefined
        if(!leafs[ld.value.type]) {
            throw new Error('No LeafNode found for ' + ld.value.type)
        }
        return leafs[ld.value.type]
    },
    identifier: (ld) => ({
        toString: () => ld.storePath,
        toArray: () => ld.storePath.split('/'),
    }),
}

// 👉 8. Create or get the context to use; create a bound Provider, Hook and LeafNode
//    - **note**: for UIS will be something like: `import { UILeafsContext } from '@ui-schema/react/UILeafsContext'`

// a new context is required, supports multiple different "render engines" that can be used concurrently
// e.g. UI-Schema Widgets + MarkDown with totally different matching and typings
const leafsContext = createLeafsContext<CustomLeafPropsSpec, CustomLeafComponents, typeof dec>(
    engine, customRenderMapping,
)

const LeafsProvider = defineLeafsProvider(leafsContext, engine, customRenderMapping)

const {Leaf, useLeafs} = defineLeafNode(leafsContext)

// 👉 9. Define some Data and use the `Leaf` to render it

const leafData: CustomLeafDataSpec[keyof CustomLeafDataSpec][] = [
    {
        type: 'headline',
        content: 'Lorem Ipsum',
    },
    {
        type: 'paragraph',
        content: 'Mauris ultrices anomima in cursus turpis massa tincidunt dui.',
    },
    {
        type: 'breakThematic',
    },
    {
        type: 'paragraph',
        content: 'Ac felis donec et odio pellentesque diam.',
    },
]

// todo: optimize so it uses `assert` maybe? target: remove `any` and do not use `as` casting
const mapToProps = <V extends { type: string }>(storePath: string, value: V): V extends { type: infer T2 extends keyof CustomLeafDataSpec } ? { [P in T2]: CustomLeafPropsSpec[P] }[T2] : never => ({
    type: value.type,
    storePath: storePath,
    value: value,
} as any)

export const DemoComponentByArray: React.FC<{}> = () => {
    return <>
        <LeafsProvider>
            {/* todo: this seems to be the most prominent position where the typing fails to infer it correctly */}
            {/*
              * for automatic rendering, the items are be casted to a non-exclusive typing, this uses the correlated union types picking,
              * https://github.com/microsoft/TypeScript/issues/30581
              * As inferred from `LeafData[]`, the `type` would be incompatible, as this demo doesn't provide a `string` default `Leaf` mapping,
              * e.g. `('headline' & 'paragraph')` will resolve to `never`, which is what is inferred here for `LeafData['type']`
              */}
            {leafData.map((ld, i) =>
                <Leaf key={i} {...mapToProps('/' + i, ld)}/>)}
        </LeafsProvider>
    </>
}

/**
 * demo component for, how to use `useLeafs` to build a custom `LeafNode` render component
 */
export const DemoComponentInCtx: React.FC<{}> = () => {
    const {engine, leafs} = useLeafs()
    const leafData: CustomLeafPropsSpec['breakThematic'] = {
        type: 'breakThematic', value: {type: 'breakThematic'},
        storePath: 'static-last',
    }
    const r = engine.decorator.run<CustomLeafPropsSpec[keyof CustomLeafPropsSpec]>(leafData)

    // todo: someday, hopefully "React.ComponentType" can be used easy and safely in TS with `extends` and stuff [TS2322]
    const Comp = engine.matcher(leafs, r) as undefined |
        React.ComponentType<DecoDataResult<CustomLeafPropsSpec[keyof CustomLeafPropsSpec], typeof dec>>

    if(typeof Comp === 'undefined') {
        const leafId = engine.identifier(r)
        throw new Error('LeafNode no `LeafComponent` at leafId: `' + leafId.toString() + '`')
    }

    return <Comp {...r}/>
}

export const DemoComponentStatic: React.FC<{}> = () => {
    return <>
        <LeafsProvider>
            {/* for static usages the Leaf typing are strict, this example strictly types `value` against `type` */}
            <Leaf
                type={'headline'}
                storePath={'/0'}
                value={{
                    type: 'headline',
                    content: 'Lorem Ipsum',
                }}
            />
            <Leaf
                type={'paragraph'}
                storePath={'/1'}
                dummy={null} // `dummy` comes from `DecoTw` / inferred from the configured `engine.decorator`
                value={{
                    type: 'paragraph',
                    content: 'Mauris ultrices anomima in cursus turpis massa tincidunt dui.',
                }}
            />
            <Leaf
                type={'breakThematic'}
                storePath={'/2'}
                value={{
                    type: 'breakThematic',
                }}
            />

            {/* this is the generic `LeafNode`, it builds the props from the given `context` */}
            <LeafNode
                context={leafsContext}
                type={'paragraph'}
                storePath={'/3'}
                value={{
                    type: 'paragraph',
                    content: 'Ac felis donec et odio pellentesque diam.',
                }}
            />

            <DemoComponentInCtx/>
        </LeafsProvider>
    </>
}

export const PageDemoByDataList: React.ComponentType = () => {
    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                <div style={{display: 'flex', flexDirection: 'column', marginTop: 8, marginBottom: 24}}>
                    <Typo component={'h1'}>Demo: <em>by data list</em></Typo>
                </div>
                <Typo component={'h2'}>Automatic</Typo>

                <div className={'o o-divider p2'} style={{display: 'flex', flexDirection: 'column', marginBottom: 24, flexGrow: 1}}>
                    <DemoComponentByArray/>
                </div>

                <Typo component={'h2'}>Static</Typo>

                <div className={'o o-divider p2'} style={{display: 'flex', flexDirection: 'column', marginBottom: 24, flexGrow: 1}}>
                    <DemoComponentStatic/>
                </div>
            </div>
        </>
    )
}
