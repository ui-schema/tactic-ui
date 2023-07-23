import { ReactDeco, DecoratorProps, DecoratorPropsNext } from '@tactic-ui/react/Deco'
import React from 'react'
import { Typo } from '../components/Styles'
import { defineLeafEngine, GenericLeafsDataSpec, LeafsRenderMapping, ReactLeafsNodeSpec } from '@tactic-ui/react/LeafsEngine'
import { CustomLeafDataSpec, CustomLeafDataType, CustomLeafPropsSpec, CustomLeafPropsWithValue, DemoDecoratorProps, DemoDecorator1ResultProps } from './widgets'

// 👉 5. Simple React-Component based decorators to provide globally working logic, state injection etc.

// 🎵 note: the decorator typing must be exactly in the following style to work,
//          - generic P + decorator-requirements
//          - return `React.ReactElement` with the `P` and if any, the props the decorator adds
//          - returning null can be omitted, if the decorator doesn't do that

function DemoDecorator<P extends DecoratorPropsNext>(p: P & DemoDecoratorProps): React.ReactElement<P & DemoDecorator1ResultProps> | null {
    // this is impossible to type - as `next` isn't yet known
    const Next = p.next()
    return <Next
        {...p}
        id={p.title.toLowerCase().replace(/[ .-]/g, '_')}
    />
}

type DemoRendererProps = {
    renderMapping: LeafsRenderMapping<ReactLeafsNodeSpec<{ [k: string]: {} }>, {}>
    type: string
}

function DemoRenderer<P extends DecoratorPropsNext>(
    {
        renderMapping,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next,
        ...p
    }: P & DemoDecoratorProps & { id: string } & DemoRendererProps,
): React.ReactElement<Omit<P, 'next' | 'renderMapping'>> {
    // todo: the return type here doesn't really make sense,
    //       but is the only way i found yet for removing the default "any"

    // the last decorator must end the run - decorators afterwards are skipped silently
    const Leaf = renderMapping.leafs[p.type] as any
    return <div className={'mb2'}>
        <p className={'my0 body2'}>id: <code>{p.id}</code></p>
        <p className={'my0 body2'}>title: <code>{p.title}</code></p>
        <Leaf
            {...p}
        />
    </div>
}

function DebugDecorator<P extends DecoratorPropsNext & { id: string }>(p: P): React.ReactElement<P> {
    const Next = p.next()
    console.log('DebugDecorator', p.id, Next)
    return <Next {...p}/>
}

// 👉 5.1. Wire up the ReactDeco with all decorators and provide the global base props.
//         The decorators should only work on the "schema contracts" (and things required for those) but not on the specific widget-props.

const deco = new ReactDeco<
    DecoratorPropsNext &
    DemoDecoratorProps &
    CustomLeafDataType<string> &
    { renderMapping: LeafsRenderMapping<ReactLeafsNodeSpec<{ [k: string]: {} }>, {}> }
>()
    .use(DemoDecorator)
    // .use((p) => {
    //     console.log(p.title)
    //     console.log(p.storePath)
    //     return null
    // })
    .use(DebugDecorator)
    .use(DemoRenderer)

// 👉 6. Map the actual `Leaf` implementations

type CustomLeafsNodeSpec = ReactLeafsNodeSpec<CustomLeafPropsSpec>

const BreakThematic: React.FC<CustomLeafPropsWithValue<CustomLeafDataType<'breakThematic'>>> =
    (props) => <hr title={props.storePath} style={{width: '100%'}}/>

// todo: it currently is not possible to type the `leafs` partial -> all in `CustomLeafsNodeSpec` must be then commonly typed, e.g. `{[type: string]: ...}`
const leafs: CustomLeafsNodeSpec = {
    headline: (props) => props.value.type === 'headline' ? <Typo component={'h3'} title={props.storePath}>{props.value.content || null}</Typo> : null,
    paragraph: (props) => props.value.type === 'paragraph' ? <Typo component={'p'} title={props.storePath}>{props.value.content || null}</Typo> : null,
    breakThematic: BreakThematic,
}

const renderMapping: LeafsRenderMapping<CustomLeafsNodeSpec, {}> = {
    leafs: leafs,
    components: {},
}

// 👉 7. Create a custom render engine out of the parts

const {
    LeafsProvider, useLeafs,
} = defineLeafEngine<
    GenericLeafsDataSpec, {},
    LeafsRenderMapping<ReactLeafsNodeSpec<GenericLeafsDataSpec>, {}>,
    ReactDeco<{}, {}, {}>
>()

// 👉 7.1. Create a custom LeafNode which maps the properties, plugins and handles the rendering

function LeafNode<
    LDS extends GenericLeafsDataSpec,
    TLeafData extends LDS[keyof LDS],
    PL extends ReactDeco<{}, {}> = ReactDeco<{}, {}>,
    CC extends {} = {},
    LRM extends LeafsRenderMapping<ReactLeafsNodeSpec<LDS>, CC> = LeafsRenderMapping<ReactLeafsNodeSpec<LDS>, CC>,
    // todo: TProps not only need to support removing injected, but also allowing overriding
    TProps extends DecoratorProps<TLeafData, PL> = DecoratorProps<TLeafData, PL>,
>(props: TProps): React.JSX.Element | null {
    const {renderMapping, decorators} = useLeafs<LDS, CC, LRM, PL>()
    console.log(renderMapping, decorators)
    const started = React.useRef<DecoratorPropsNext['next'] | null>(null)
    started.current = decorators.start()
    const next = React.useCallback(() => (started.current as NonNullable<typeof started.current>)(), [])
    const Next = next()
    // todo: `Next` can not be typed in any way i've found, thus here no error will be shown
    return <Next
        {...props}
        next={next}
        renderMapping={renderMapping}
    />
}

// an alternative for a more strict working LeafNode with more baked in
const StaticLeafNode = LeafNode as
    (<D2 extends CustomLeafPropsSpec[keyof CustomLeafPropsSpec]>(
        props: DecoratorProps<D2, typeof deco>,
    ) => React.JSX.Element | null)

//
// 👉 Example 1: using the LeafNode to statically define where something is rendered
//

const DemoStatic: React.FC = () => {
    /* todo: the engine doesn't validate that decorators and renderMapping are compatible */
    return <LeafsProvider<CustomLeafPropsSpec>
        decorators={deco}
        renderMapping={renderMapping}
    >
        <LeafNode<CustomLeafPropsSpec, CustomLeafPropsSpec['paragraph'], typeof deco>
            title={'Skill 01'}
            type={'paragraph'}
            value={{content: '', type: 'paragraph'}}
            storePath={'/0'}
        />
        <LeafNode<CustomLeafPropsSpec, CustomLeafPropsSpec['paragraph'], typeof deco>
            title={'Skill 02'}
            type={'paragraph'}
            value={{content: '', type: 'paragraph'}}
            storePath={'/1'}
        />
        {/* todo: without the explicit props, a mismatched nested-type and root-type don't cause an error when incompatible */}
        <StaticLeafNode<CustomLeafPropsSpec['paragraph']>
            title={'Skill 03'}
            type={'paragraph'}
            value={{content: '', type: 'paragraph'}}
            storePath={'/2'}
        />
    </LeafsProvider>
}

//
// 👉 Example 2: using the LeafNode to render a data-list
//

const leafData: CustomLeafDataSpec[keyof CustomLeafDataSpec][] = [
    {
        type: 'headline',
        content: 'Lorem Ipsum',
    },
    {
        type: 'paragraph',
        content: 'Mauris ultrices anomima in cursus turpis massa tincidunt dui.',
    },
    {
        type: 'breakThematic',
    },
    {
        type: 'paragraph',
        content: 'Ac felis donec et odio pellentesque diam.',
    },
]
const DemoAutomatic: React.FC = () => {
    /* todo: the engine doesn't validate that decorators and renderMapping are compatible */
    return <LeafsProvider<CustomLeafPropsSpec>
        decorators={deco}
        renderMapping={renderMapping}
    >
        {leafData.map((ld, i) =>
            <LeafNode<CustomLeafPropsSpec, CustomLeafPropsSpec[typeof ld.type], typeof deco>
                key={i}
                {...{
                    // title is just some dummy for the decorators
                    title: 'Type ' + ld.type + ' No ' + i,
                    // re-mapping data to props
                    type: ld.type,
                    storePath: '/' + i,
                    value: ld,
                    // the "remove props injected by decorators" is also needed here
                } as DecoratorProps<CustomLeafPropsSpec[typeof ld.type], typeof deco>}
            />)}
    </LeafsProvider>
}

export const PageDemoDecoratorBasic: React.ComponentType = () => {
    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                <div style={{display: 'flex', flexDirection: 'column', marginTop: 8, marginBottom: 24}}>
                    <Typo component={'h1'}>Demo: <em>Decorator Basic</em></Typo>
                </div>
                <Typo component={'h2'}>With Static Rendering</Typo>

                <div className={'o o-divider p2'} style={{display: 'flex', flexDirection: 'column', marginBottom: 24, flexGrow: 1}}>
                    <DemoStatic/>
                </div>

                <Typo component={'h2'}>With Rendering a Data-List</Typo>

                <div className={'o o-divider p2'} style={{display: 'flex', flexDirection: 'column', marginBottom: 24, flexGrow: 1}}>
                    <DemoAutomatic/>
                </div>
            </div>
        </>
    )
}
