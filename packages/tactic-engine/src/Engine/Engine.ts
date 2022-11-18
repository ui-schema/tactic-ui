import { GenericLeafsDataSpec } from '@tactic-ui/engine/Leaf'
import { Deco, DecoDataPluck, DecoDataResult } from '@tactic-ui/engine/Deco'

export type LeafsRenderMatcher<DCP extends Deco<{}>, LDS extends GenericLeafsDataSpec, LNS extends { [K in keyof LDS]: any } = { [K in keyof LDS]: any }, CC extends {} = {}, P extends DecoDataResult<LDS[keyof LDS], DCP> = DecoDataResult<LDS[keyof LDS], DCP>> = (
    renderMapping: LeafsRenderMapping<LNS, CC>['leafs'],
    ld: P,
) => LNS[keyof LDS]

export interface TreeEngine<LDS extends GenericLeafsDataSpec, DCP extends Deco<{}>, M extends LeafsRenderMatcher<DCP, LDS> = LeafsRenderMatcher<DCP, LDS>> {
    // todo: when using decorator, the `Leaf` props would be passed to decorator and only what decorator returns will passed to `Leaf`
    // todo: support custom decorators somehow - if possible without higher-ordered kinds
    // widgetDecorator?: (LeafNode: LeafsDefaultNodeType<LDS[keyof LDS]>) => <DP extends DCP>(props: DP) => JSX.Element | null
    // maybe use this to solve the `props` vs `values` typing issue
    decorator: DCP
    // todo: `identifier` would only be required for e.g. data-binding enabled LeafEngines; for UIS it would also mean to type strongly the return of `toString()` would need to match with both/either `schema` and `value` type -> which wouldn't be possible for e.g. tuples
    identifier: <P extends DecoDataPluck<LDS[keyof LDS], DCP> = DecoDataPluck<LDS[keyof LDS], DCP>>(ld: P) => {
        toString: () => string
        toArray: () => string[]
    }
    matcher: M
}

export interface LeafsRenderMapping<LNS extends {} = {}, CC extends {} = {}> {
    components: CC
    leafs: LNS
    children?: never
}

