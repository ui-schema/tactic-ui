import React from 'react'

export class ReactDeco<PG extends {}, PG0 extends {} = PG, PR extends {} = {}> {
    private readonly decorators: any[] = []

    public use<DR extends {}, D extends (p: PG) => unknown>(
        decorator: D,
    ): ReactDeco<
        D extends (p: any) => React.ReactElement<infer R> ? R & PG :
            D extends (p: any) => React.ReactElement<infer R> | null ? R & PG : PG,
        PG0,
        DR & PR
    > {
        // to allow omitting props, the PG mustn't be used on inferring,
        // plugin typings require careful crafting to not have any/loose/missing props
        // BUT without it, the "collecting all yet existing" isn't possible here
        //     and this is impossible to type with the desired modularity inside the Plugins themselves (inside = not using PG, only R)
        this.decorators.push(decorator)
        return this
    }

    public start() {
        const decoratos = [...this.decorators]
        return function nextPlugin() {
            return decoratos.shift()
        }
    }
}

export type DecoratorPropsInjected<PL extends ReactDeco<{}, {}>> = PL extends ReactDeco<infer TPropsInjected0, any> ? TPropsInjected0 : {}
export type DecoratorPropsDefault<PL extends ReactDeco<{}, {}>> = PL extends ReactDeco<any, infer TPropsDefault> ? TPropsDefault : {}
export type DecoratorProps<P extends {}, PL extends ReactDeco<{}, {}>> = Omit<P, keyof Omit<DecoratorPropsInjected<PL>, keyof DecoratorPropsDefault<PL>>>


export interface DecoratorPropsNext {
    next: () => ReactBaseDecorator<DecoratorPropsNext>
}

export type ReactBaseDecorator<P1 extends DecoratorPropsNext> = <P extends P1>(p) => React.ReactElement<P & {}> | null
