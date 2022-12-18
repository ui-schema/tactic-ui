import React from 'react'
import { Deco, DecoDataResult } from '@tactic-ui/react/Deco'
import { LeafsRenderMapping, LeafsRenderMatcher, LeafsEngine } from '@tactic-ui/engine/Engine'
import { GenericLeafsDataSpec } from '@tactic-ui/engine/Leaf'

export type ReactLeafDefaultNodeType<P = {}> = (props: P, context?: any) => React.ReactElement | null

export type ReactLeafsNodeSpec<LDS extends GenericLeafsDataSpec, DCP extends Deco<{}>> = {
    [K in keyof LDS]: ReactLeafDefaultNodeType<DecoDataResult<LDS[K], DCP>>
}

export type ReactLeafsRenderMatcher<DCP extends Deco<{}>, LDS extends GenericLeafsDataSpec, CC extends {}> =
    LeafsRenderMatcher<DCP, LDS, ReactLeafsNodeSpec<LDS, DCP>, CC>

export type LeafsContext<LDS extends GenericLeafsDataSpec = GenericLeafsDataSpec, CC extends {} = {}, DCP extends Deco<{}> = Deco<{}>> =
    LeafsRenderMapping<ReactLeafsNodeSpec<LDS, DCP>, CC> &
    { engine: LeafsEngine<LDS, DCP, ReactLeafsRenderMatcher<DCP, LDS, CC>> }

export type LeafsContextAsProps<LDS extends GenericLeafsDataSpec, CC extends {}, DCP extends Deco<{}>> =
    Partial<Omit<LeafsContext<LDS, CC, DCP>, 'children'>>

// todo: that the `decorator` can overwrite the typings, it must be added to the ContextTyping first
//     <LDS extends GenericLeafsDataSpec, LNS extends { [K in keyof LDS]: any }, CC extends {}, DCP extends Deco<{}>, PG extends DCP extends Deco<LDS[keyof LDS], infer P> ? P : never, RE extends DCP extends Deco<LDS[keyof LDS], any, infer R> ? R : never>(
export const createLeafsContext =
    <LDS extends GenericLeafsDataSpec, CC extends {}, DCP extends Deco<{}>>(
        engine?: LeafsEngine<LDS, DCP, ReactLeafsRenderMatcher<DCP, LDS, CC>>,
        renderMapping?: LeafsRenderMapping<ReactLeafsNodeSpec<LDS, DCP>, CC>,
    ) =>
        React.createContext<LeafsContext<LDS, CC, DCP>>(
            // as `engine` and `render-mapping` also must be defined at `defineLeafsProvider`, it would be better to make it here optional
            // theoretically wrong, but allows creating contexts as devs without needing to specify engine/leafs,
            // as required in provider -> won't cause issues when setup correctly
            // depending on setup, here is a circular dependency, thus the @ts-ignore would often be required as developer
            // @ts-ignore
            {
                ...renderMapping,
                ...(engine ? {engine: engine} : {}),
            } as LeafsContext<LDS, CC, DCP>,
        )

export const useLeafs =
    <LDS extends GenericLeafsDataSpec, CC extends {}, DCP extends Deco<{}>>(
        context: React.Context<LeafsContext<LDS, CC, DCP>>
    ) => React.useContext<LeafsContext<LDS, CC, DCP>>(context)

export const defineLeafsProvider = <LDS extends GenericLeafsDataSpec, CC extends {}, DCP extends Deco<{}>>(
    context: React.Context<LeafsContext<LDS, CC, DCP>>,
    defaultEngine: LeafsEngine<LDS, DCP, ReactLeafsRenderMatcher<DCP, LDS, CC>>,
    defaultMapping: LeafsRenderMapping<ReactLeafsNodeSpec<LDS, DCP>, CC>,
) => {
    const LeafsProvider = (
        {
            children,
            ...overrides
        }: React.PropsWithChildren<LeafsContextAsProps<LDS, CC, DCP>>,
    ) => {
        const ctx: LeafsContext<LDS, CC, DCP> = React.useMemo(() => ({
            ...defaultMapping,
            engine: defaultEngine,
            ...overrides,
            // todo: this falsy detect changes when the props have just moved, but are still the same
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }), [...Object.values(overrides), ...Object.keys(overrides)])

        const LeafsContextProvider = context.Provider
        return <LeafsContextProvider value={ctx}>{children}</LeafsContextProvider>
    }
    return LeafsProvider
}
