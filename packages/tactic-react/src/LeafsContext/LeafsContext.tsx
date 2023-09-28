import React from 'react'
import { ReactDeco } from '@tactic-ui/react/Deco'
import { LeafsRenderMapping, GenericLeafsDataSpec } from '@tactic-ui/engine/Leaf'
import { ReactLeafsNodeSpec, LeafsEngine } from '@tactic-ui/react/LeafsEngine'


export function createLeafsContext<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TComponents extends {},
    TDeco extends ReactDeco<{}, {}, {}>,
    // todo: as here `ReactLeafsNodeSpec<>` us used, it makes the whole `LeafsEngine` typing hard to get correctly customized in complex use cases (ui-schema),
    //       same as in `LeafsEngine.ts`
    TRender extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponents>,
>(initialValue?: LeafsEngine<TLeafsDataMapping, TComponents, TDeco, TRender>): React.Context<LeafsEngine<TLeafsDataMapping, TComponents, TDeco, TRender>> {
    return React.createContext(initialValue as any)
}

/**
 * @deprecated use `createLeafsContext` instead
 */
export const createLeafContext = createLeafsContext

export function defineLeafsContext<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TComponents extends {},
    TDeco extends ReactDeco<{}, {}, {}>,
    // todo: as here `ReactLeafsNodeSpec<>` us used, it makes the whole `LeafsEngine` typing hard to get correctly customized in complex use cases (ui-schema),
    //       same as in `LeafsEngine.ts`
    TRender extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponents>,
>(context: React.Context<LeafsEngine<TLeafsDataMapping, TComponents, TDeco, TRender>>) {
    const useLeafs = <
        TLeafsDataMapping2 extends TLeafsDataMapping = TLeafsDataMapping,
        TComponents2 extends TComponents = TComponents,
        TDeco2 extends TDeco = TDeco,
        TRender2 extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping2>, TComponents2> = LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping2>, TComponents2>,
    >() => {
        return React.useContext<LeafsEngine<TLeafsDataMapping2, TComponents2, TDeco2, TRender2>>(
            context as unknown as React.Context<LeafsEngine<TLeafsDataMapping2, TComponents2, TDeco2, TRender2>>,
        )
    }

    function LeafsProvider<
        TLeafsDataMapping2 extends TLeafsDataMapping = TLeafsDataMapping,
        TComponents2 extends TComponents = TComponents,
        TDeco2 extends TDeco = TDeco,
        TRender2 extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping2>, TComponents2> = LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping2>, TComponents2>,
        // todo: integrate a typing which validates that the provided deco-result-props are compatible with props of `TRender2['leafs']`
    >(
        {
            children,
            deco, renderMap,
        }: React.PropsWithChildren<LeafsEngine<TLeafsDataMapping2, TComponents2, TDeco2, TRender2>>,
    ) {
        const ctx = React.useMemo((): LeafsEngine<TLeafsDataMapping2, TComponents2, TDeco2, TRender2> => ({
            deco: deco, renderMap: renderMap,
        }), [deco, renderMap])

        const LeafsContextProvider = (context as unknown as React.Context<LeafsEngine<TLeafsDataMapping2, TComponents2, TDeco2, TRender2>>).Provider
        return <LeafsContextProvider value={ctx}>{children}</LeafsContextProvider>
    }

    return {
        useLeafs,
        LeafsProvider,
    }
}

/**
 * @deprecated use `defineLeafsContext` instead
 */
export const defineLeafEngine = defineLeafsContext
