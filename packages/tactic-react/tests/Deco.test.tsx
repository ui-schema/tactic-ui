/** @jest-environment jsdom */
import { DecoratorPropsNext, ReactDeco } from '@tactic-ui/react/Deco'
import { LeafsRenderMapping, ReactLeafsNodeSpec } from '@tactic-ui/react/LeafsEngine'
import React from 'react'
import { render } from '@testing-library/react'

describe('Deco', () => {
    it('Deco', async() => {
        function DemoRenderer<P extends DecoratorPropsNext>(
            {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                renderMap, next,
                ...p
            }: P & { type: string } & { renderMap: LeafsRenderMapping<ReactLeafsNodeSpec<{ [k: string]: {} }>, {}> },
        ): React.ReactElement<P> {
            const Leaf = renderMap.leafs[p.type] as any
            return <div className={'demo-renderer'}>
                <Leaf {...p}/>
            </div>
        }

        const deco = new ReactDeco<
            DecoratorPropsNext &
            { type: string } &
            {
                renderMap: LeafsRenderMapping<ReactLeafsNodeSpec<{ [k: string]: {} }>, {}>
            }
        >()
            .use(DemoRenderer)

        const Next = deco.next(0)

        const {queryByText, container} = render(
            <Next
                renderMap={{leafs: {text: () => <div className={'leaf-text'}>text</div>}}}
                type={'text'}
            />,
        )
        expect(container.querySelectorAll('.demo-renderer').length).toBe(1)
        expect(container.querySelectorAll('.leaf-text').length).toBe(1)
        expect(queryByText('number')).toBe(null)
        expect(queryByText('text')).not.toBe(null)
    })
})
