export class Deco<PG extends {}, PN extends {} = PG, RG extends {} = {}> {
    protected readonly decorators: ((payload: any) => any)[] = []

    public use<D extends (p: PN) => any, PD extends D extends (p: infer D1) => any ? D1 : never, R extends D extends (p: PD) => infer R1 ? R1 : never, P extends PD>(
        decorator: D,
        // for "cleaned-up" required-collect:
        // pick from R those which are not in P to get "new-returns"
        // collect those in a RG
        // omit from P those which are already in that RG to only get "new input but not returned yet"
        // todo: the current `&` unions rely on the `P extends X` at the decorator, maybe also solvable with correlated-types https://github.com/microsoft/TypeScript/issues/30581
    ): Deco<PG & Omit<P, keyof RG>, P & R, Omit<R, keyof P> & RG> {
        this.decorators.push(decorator)
        return this as any
    }

    public run<D extends {} = {}>(payload: PG): DecoDataResult<D, typeof this> {
        return this.decorators.reduce((pld, decorator) => decorator(pld), payload) as any
    }
}

export type ExtractDecoReturn<DCP extends Deco<{}>> = DCP extends Deco<{}, any, infer R> ? R : never
export type ExtractDecoPayload<DCP extends Deco<{}>> = DCP extends Deco<infer P, any, any> ? P : never
/**
 * removes what is injected by `Deco` and adds what is required by it
 */
export type DecoDataPluck<D extends {}, DCP extends Deco<{}>> = Omit<D, keyof ExtractDecoReturn<DCP>> & ExtractDecoPayload<DCP>
/**
 * adds what is injected by `Deco` and applies the deco data onto it
 */
export type DecoDataResult<D extends {}, DCP extends Deco<{}>> = D & ExtractDecoPayload<DCP> & ExtractDecoReturn<DCP>
