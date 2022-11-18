import React from 'react'
import { LeafsContext, ReactLeafDefaultNodeType, useLeafs } from '@tactic-ui/react/LeafsProvider'
import { DecoDataResult, GenericLeafsDataSpec } from '@tactic-ui/engine'
import { Deco, DecoDataPluck } from '@tactic-ui/react/Deco'

// todo: IntelliJ shows invalid "required props missing" where TS got no problem, maybe in general safer to `infer` all from CTX?
/*export const LeafNode = <CTX extends React.Context<LeafsContext>, LDS extends CTX extends React.Context<LeafsContext<infer LDS0>> ? LDS0 : never, LNS extends CTX extends React.Context<LeafsContext<any, infer LNS0>> ? LNS0 : never, CC extends CTX extends React.Context<LeafsContext<any, any, infer CC0>> ? CC0 : never, DCP extends CTX extends React.Context<LeafsContext<any, any, any, infer CC0>> ? CC0 : never>(
    props: DecoDataPluck<LDS[keyof LDS], DCP> & {
        context: CTX
    },
): JSX.Element | null => {*/

// todo: maybe add `P extends {} = {}` to support similar loose-typing overwrites like for `WidgetProps` in UIS
export const LeafNode = <LDS extends GenericLeafsDataSpec, DCP extends Deco<{}>, CC extends {}>(
    props: DecoDataPluck<LDS[keyof LDS], DCP> & {
        context: React.Context<LeafsContext<LDS, CC, DCP>>
    },
): JSX.Element | null => {
    const {
        context,
        ...propsTmp
    } = props
    const {engine, leafs} = useLeafs<LDS, CC, DCP>(context)
    const nextProps = engine.decorator.run<LDS[keyof LDS]>(propsTmp)

    // todo: someday, hopefully "React.ComponentType" can be used easy and safely in TS with `extends` and stuff [TS2322]
    const LeafComponent = engine.matcher(leafs, nextProps) as undefined |
        ReactLeafDefaultNodeType<DecoDataResult<LDS[keyof LDS], DCP>>

    if(typeof LeafComponent === 'undefined') {
        const leafId = engine.identifier(nextProps)
        throw new Error('LeafNode no `LeafComponent` at leafId: `' + leafId.toString() + '`')
    }

    return <LeafComponent {...nextProps}/>
}

export const defineLeafNode = <LDS extends GenericLeafsDataSpec, DCP extends Deco<{}>, CC extends {} = {}>(
    leafsContext: React.Context<LeafsContext<LDS, CC, DCP>>,
) => {
    const useLeafs = (): LeafsContext<LDS, CC, DCP> => React.useContext(leafsContext)

    // todo: maybe add `P extends {} = {}` and rename current `P` to `DDP`, to support similar loose-typing overwrites like for `WidgetProps` in UIS
    const LeafNode = <P extends DecoDataPluck<LDS[keyof LDS], DCP>>(props: P): JSX.Element | null => {
        const {engine, leafs} = useLeafs()

        const nextProps = engine.decorator.run<LDS[keyof LDS]>(props)
        // todo: someday, hopefully "React.ComponentType" can be used easy and safely in TS with `extends` and stuff [TS2322]
        const LeafComponent = engine.matcher(leafs, nextProps) as undefined |
            ReactLeafDefaultNodeType<DecoDataResult<LDS[keyof LDS], DCP>>

        if(typeof LeafComponent === 'undefined') {
            const leafId = engine.identifier(nextProps)
            throw new Error('LeafNode no `LeafComponent` at leafId: `' + leafId.toString() + '`')
        }

        return <LeafComponent {...nextProps}/>
    }

    return {
        Leaf: LeafNode,
        useLeafs: useLeafs,
    }
}
