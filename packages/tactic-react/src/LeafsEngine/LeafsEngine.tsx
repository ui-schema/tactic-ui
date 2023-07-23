import { ReactDeco } from '@tactic-ui/react/Deco'
import React from 'react'
import { LeafsRenderMapping, GenericLeafsDataSpec } from '@tactic-ui/engine/Leaf'

export type ReactLeafDefaultNodeType<P = {}> = (props: P, context?: any) => React.ReactNode

export type ReactLeafsNodeSpec<LDS extends GenericLeafsDataSpec> = {
    [K in keyof LDS]: ReactLeafDefaultNodeType<LDS[K]>
}

export interface LeafsEngine<
    LDS extends GenericLeafsDataSpec,
    CC extends {},
    LRM extends LeafsRenderMapping<ReactLeafsNodeSpec<LDS>, CC>,
    PL extends ReactDeco<{}, {}, {}>
> {
    renderMapping: LRM
    decorators: PL
}

export function defineLeafEngine<
    LDS extends GenericLeafsDataSpec,
    CC extends {},
    LRM extends LeafsRenderMapping<ReactLeafsNodeSpec<LDS>, CC>,
    PL extends ReactDeco<{}, {}, {}>
>() {
    const context = React.createContext<LeafsEngine<LDS, CC, LRM, PL>>(undefined as any)

    const useLeafs = <LDS2 extends LDS = LDS, CC2 extends CC = CC, LRM2 extends LeafsRenderMapping<ReactLeafsNodeSpec<LDS2>, CC2> = LeafsRenderMapping<ReactLeafsNodeSpec<LDS2>, CC2>, PL2 extends PL = PL>() =>
        React.useContext<LeafsEngine<LDS2, CC2, LRM2, PL2>>(
            context as unknown as React.Context<LeafsEngine<LDS2, CC2, LRM2, PL2>>,
        )

    function LeafsProvider<LDS2 extends LDS = LDS, CC2 extends CC = CC, LRM2 extends LeafsRenderMapping<ReactLeafsNodeSpec<LDS2>, CC2> = LeafsRenderMapping<ReactLeafsNodeSpec<LDS2>, CC2>, PL2 extends PL = PL>(
        {
            children,
            decorators, renderMapping,
        }: React.PropsWithChildren<LeafsEngine<LDS2, CC2, LRM2, PL2>>,
    ) {
        const ctx = React.useMemo(() => ({
            decorators, renderMapping,
        }), [decorators, renderMapping])

        const LeafsContextProvider = (context as unknown as React.Context<LeafsEngine<LDS2, CC2, LRM2, PL2>>).Provider
        return <LeafsContextProvider value={ctx}>{children}</LeafsContextProvider>
    }

    return {
        context: context,
        useLeafs,
        LeafsProvider,
    }
}
