import React from 'react'
import { ReactDeco } from '@tactic-ui/react/Deco'
import { LeafsRenderMapping, GenericLeafsDataSpec } from '@tactic-ui/engine/Leaf'

/**
 * A wider `React.ComponentType`, as the remapping had a lot of issues when `React.ComponentType` was used internally, somehow not reproducible here or in others with React18.
 * But in ui-schema with the latest React 18 setup, `React.ComponentType` won't work without the `React.ComponentClass<P>`
 */
export type ReactLeafDefaultNodeType<P = {}> =
    React.ComponentClass<P> |
    ((props: P, context?: any) => React.ReactNode)

export type ReactLeafsNodeSpec<LDS extends GenericLeafsDataSpec> = {
    [K in keyof LDS]: ReactLeafDefaultNodeType<NonNullable<LDS[K]>>
}

export interface LeafsEngine<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TComponents extends {},
    TDeco extends ReactDeco<{}, {}, {}>,
    TRender extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponents>,
> {
    renderMap: TRender
    deco?: TDeco
}
