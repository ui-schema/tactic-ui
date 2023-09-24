import { ReactDeco } from '@tactic-ui/react/Deco'
import React from 'react'
import { LeafsRenderMapping, GenericLeafsDataSpec } from '@tactic-ui/engine/Leaf'

export type ReactLeafDefaultNodeType<P = {}> = (props: P, context?: any) => React.ReactNode

export type ReactLeafsNodeSpec<LDS extends GenericLeafsDataSpec> = {
    [K in keyof LDS]: ReactLeafDefaultNodeType<NonNullable<LDS[K]>>
}

export interface LeafsEngine<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TComponents extends {},
    TDeco extends ReactDeco<{}, {}, {}>,
    TRender extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponents>,
> {
    render: TRender
    deco?: TDeco
}

export function createLeafContext<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TComponents extends {},
    TDeco extends ReactDeco<{}, {}, {}>,
    TRender extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponents>,
>(): React.Context<LeafsEngine<TLeafsDataMapping, TComponents, TDeco, TRender>> {
    return React.createContext(undefined as any)
}

export function defineLeafEngine<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TComponents extends {},
    TDeco extends ReactDeco<{}, {}, {}>,
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
    >(
        {
            children,
            deco, render,
        }: React.PropsWithChildren<LeafsEngine<TLeafsDataMapping2, TComponents2, TDeco2, TRender2>>,
    ) {
        const ctx = React.useMemo((): LeafsEngine<TLeafsDataMapping2, TComponents2, TDeco2, TRender2> => ({
            deco: deco, render: render,
        }), [deco, render])

        const LeafsContextProvider = (context as unknown as React.Context<LeafsEngine<TLeafsDataMapping2, TComponents2, TDeco2, TRender2>>).Provider
        return <LeafsContextProvider value={ctx}>{children}</LeafsContextProvider>
    }

    return {
        useLeafs,
        LeafsProvider,
    }
}
