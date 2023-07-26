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
    TRender extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponents>,
    TDeco extends ReactDeco<{}, {}, {}>
> {
    render: TRender
    deco?: TDeco
}

export function defineLeafEngine<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TComponents extends {},
    TRender extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponents>,
    TDeco extends ReactDeco<{}, {}, {}>,
    TLeafsEngine extends LeafsEngine<TLeafsDataMapping, TComponents, TRender, TDeco> = LeafsEngine<TLeafsDataMapping, TComponents, TRender, TDeco>,
    // todo: due to the duck-typing and multi extension, it seems `LeafsEngine` can only be defined here but not at provider/leafs usage
    TLeafsExtra extends Omit<TLeafsEngine, keyof LeafsEngine<any, any, any, any>> = Omit<TLeafsEngine, keyof LeafsEngine<any, any, any, any>>
>(customContext?: React.Context<TLeafsEngine>) {
    const context = customContext || React.createContext<TLeafsEngine>(undefined as any)

    const useLeafs = <
        TLeafsDataMapping2 extends TLeafsDataMapping = TLeafsDataMapping,
        TComponents2 extends TComponents = TComponents,
        TRender2 extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping2>, TComponents2> = LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping2>, TComponents2>,
        TDeco2 extends TDeco = TDeco,
    >() => {
        return React.useContext<LeafsEngine<TLeafsDataMapping2, TComponents2, TRender2, TDeco2> & TLeafsExtra>(
            context as unknown as React.Context<LeafsEngine<TLeafsDataMapping2, TComponents2, TRender2, TDeco2> & TLeafsExtra>,
        )
    }

    function LeafsProvider<
        TLeafsDataMapping2 extends TLeafsDataMapping = TLeafsDataMapping,
        TComponents2 extends TComponents = TComponents,
        TRender2 extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping2>, TComponents2> = LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping2>, TComponents2>,
        TDeco2 extends TDeco = TDeco
    >(
        {
            children,
            deco, render, ...rest
        }: React.PropsWithChildren<LeafsEngine<TLeafsDataMapping2, TComponents2, TRender2, TDeco2> & TLeafsExtra>,
    ) {
        const ctx = React.useMemo(() => ({
            deco: deco, render: render,
            ...rest,
            // eslint-disable-next-line react-hooks/exhaustive-deps
        } as LeafsEngine<TLeafsDataMapping2, TComponents2, TRender2, TDeco2> & TLeafsExtra), [deco, render, ...Object.keys(rest), ...Object.values(rest)])

        const LeafsContextProvider = (context as unknown as React.Context<LeafsEngine<TLeafsDataMapping2, TComponents2, TRender2, TDeco2> & TLeafsExtra>).Provider
        return <LeafsContextProvider value={ctx}>{children}</LeafsContextProvider>
    }

    return {
        context: context,
        useLeafs,
        LeafsProvider,
    }
}
