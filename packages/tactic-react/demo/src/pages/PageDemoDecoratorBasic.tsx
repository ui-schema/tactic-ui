import { ReactDeco, DecoratorProps, DecoratorPropsNext, DecoratorNextFn } from '@tactic-ui/react/Deco'
import React from 'react'
import { Typo } from '../components/Styles'
import { defineLeafEngine, GenericLeafsDataSpec, LeafsEngine, LeafsRenderMapping, ReactLeafsNodeSpec } from '@tactic-ui/react/LeafsEngine'
import { CustomLeafDataSpec, CustomLeafDataType, CustomLeafPropsSpec, CustomLeafPropsWithValue, DemoDecoratorProps, DemoDecorator1ResultProps } from './leafs'


// 👉 1. to 4. are in `leafs.ts`
//
//
// 👉 5.1. Create a custom render engine out of the parts

type CustomLeafsNodeSpec = ReactLeafsNodeSpec<CustomLeafPropsSpec>
type CustomComponents = {}
type CustomLeafsRenderMapping<
    TLeafsMapping extends {} = {},
    TComponentsMapping extends {} = {}
> = LeafsRenderMapping<TLeafsMapping, TComponentsMapping>
type CustomLeafsEngine<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TComponents extends {},
    TRender extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponents>,
    TDeco extends ReactDeco<{}, {}, {}>
> = LeafsEngine<TLeafsDataMapping, TComponents, TRender, TDeco> & {
    settings: { hideTitles?: boolean }
}

const {
    LeafsProvider, useLeafs,
    // context,
} = defineLeafEngine<
    GenericLeafsDataSpec, CustomComponents,
    CustomLeafsRenderMapping<ReactLeafsNodeSpec<GenericLeafsDataSpec>, CustomComponents>,
    ReactDeco<{}, {}>,
    CustomLeafsEngine<GenericLeafsDataSpec, CustomComponents, CustomLeafsRenderMapping<ReactLeafsNodeSpec<GenericLeafsDataSpec>, CustomComponents>, ReactDeco<{}, {}>>
>()

// 👉 5.2. Create a custom LeafNode which maps the properties, decorators and handles the rendering

type LeafNodeInjected = 'next' | keyof CustomLeafsEngine<any, any, any, any>

function LeafNode<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TDeco extends ReactDeco<{}, {}> = ReactDeco<{}, {}>,
    TLeafData extends TLeafsDataMapping[keyof TLeafsDataMapping] = TLeafsDataMapping[keyof TLeafsDataMapping],
    TComponentsMapping extends {} = {},
    TRender extends CustomLeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponentsMapping> = CustomLeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponentsMapping>,
    // todo: TProps not only needs to support removing injected, but also allowing overriding those injected
    TProps extends DecoratorProps<NonNullable<TLeafData>, TDeco> = DecoratorProps<NonNullable<TLeafData>, TDeco>,
>(
    props: Omit<TProps, LeafNodeInjected>, // remove the props injected by LeafNode
): React.JSX.Element | null {
    const {deco, render, settings} = useLeafs<TLeafsDataMapping, TComponentsMapping, TRender, TDeco>()
    if(!deco) {
        throw new Error('This LeafNode requires decorators, maybe missed `deco` at the `LeafsProvider`?')
    }

    const started = React.useRef<DecoratorNextFn<{ [k in LeafNodeInjected]: any }> | null>(null)

    started.current = deco.start()
    const next = React.useCallback(() => (started.current as NonNullable<typeof started.current>)(), [])

    // `Next` can not be typed in any way I've found (by inferring),
    // as the next decorator isn't yet known, only when wiring up the Deco,
    // thus here no error will be shown, except the safeguard that "all LeafNode injected are somehow passed down".
    const Next = next()
    return <Next
        {...props}
        deco={deco}
        render={render}
        next={next}
        settings={settings}
    />
}

// an alternative for a more strict working LeafNode with more baked in
const StaticLeafNode = LeafNode as
    (<D2 extends CustomLeafPropsSpec[keyof CustomLeafPropsSpec]>(
        props: Omit<DecoratorProps<NonNullable<D2>, typeof deco>, LeafNodeInjected>,
    ) => React.JSX.Element | null)


// 👉 6. Simple React-Component based decorators to provide globally working logic, state injection etc.

// 🎵 note: the decorator typing must be exactly in the following style to work:
//          - generic P + decorator-requirements
//          - return `React.ReactElement<P & Res>` with the incoming `P` and if any, the props the decorator injects
//          - returning `| null` can be omitted, if the decorator doesn't do that
//          - using decorator-requirements only in the function parameter signature `fn(p: P & DemoDecoratorProps)` - and not at the fn-generics,
//            safeguards against leaking the requirements into the injected (result) props

// some very simple decorator, which makes an `id` prop from the `title` prop
function DemoDecorator<P extends DecoratorPropsNext>(p: P & DemoDecoratorProps): React.ReactElement<P & DemoDecorator1ResultProps> | null {
    const Next = p.next()
    return <Next
        {...p}
        id={p.title.toLowerCase().replace(/[ .-]/g, '_')}
    />
}

//
// 💎 the renderer - is also a decorator!
//

type DemoRendererProps = {
    // todo: try to make the render typing a bit stricter without circular CustomLeafProps import dependencies
    render: CustomLeafsRenderMapping<ReactLeafsNodeSpec<{ [k: string]: {} }>, {}>
    settings: { hideTitles?: boolean }
    type: string
}

function DemoRenderer<P extends DecoratorPropsNext>(
    {
        render,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next,
        settings,
        ...p
    }: P & DemoDecoratorProps & { id: string } & DemoRendererProps,
): React.ReactElement<P> {
    // the last decorator must end the run - decorators afterwards are skipped silently
    const Leaf = render.leafs[p.type] as any
    return <div className={'mb2'}>
        {settings?.hideTitles ? null : <>
            <p className={'my0 body2'}>id: <code>{p.id}</code></p>
            <p className={'my0 body2'}>title: <code>{p.title}</code></p>
        </>}

        <Leaf {...p}/>
    </div>
}

function DebugDecorator<P extends { next: DecoratorNextFn<{ debug: true }> }>(p: P & { id: string }): React.ReactElement<P & { debug: true }> {
    const Next = p.next()
    console.log('DebugDecorator', p.id, Next)
    return <Next
        {...p}
        // this prop is required - of course it's possible to manually type the `next` stricter - just not by inferring, and it won't be validated in a higher level
        debug
    />
}


// 👉 7. Wire up the ReactDeco with all decorators and provide the global base props.
//       The decorators should only work on the "schema contracts" (and things required for those) but not on the specific leaf-props.

const deco = new ReactDeco<
    DecoratorPropsNext &
    DemoDecoratorProps &
    CustomLeafDataType<string> &
    {
        render: CustomLeafsRenderMapping<ReactLeafsNodeSpec<{ [k: string]: {} }>, CustomComponents>
        settings: { hideTitles?: boolean }
    }
>()
    .use(DemoDecorator)
    // .use((p) => {
    //     console.log(p.title)
    //     console.log(p.id)
    //     return null
    // })
    .use(DebugDecorator)
    .use(DemoRenderer)

// 👉 8. Map the actual `Leaf` implementations

const BreakThematic: React.FC<CustomLeafPropsWithValue<CustomLeafDataType<'breakThematic'>>> =
    (props) => <hr title={props.storePath} style={{width: '100%'}}/>

const leafs: CustomLeafsNodeSpec = {
    headline: (props) => props.value.type === 'headline' ? <Typo component={'h3'} title={props.storePath}>{props.value.content || null}</Typo> : null,
    paragraph: (props) => props.value.type === 'paragraph' ? <Typo component={'p'} title={props.storePath}>{props.value.content || null}</Typo> : null,
    breakThematic: BreakThematic,
}

const render: CustomLeafsRenderMapping<CustomLeafsNodeSpec, CustomComponents> = {
    leafs: leafs,
    components: {},
}

//
// 👉 Example 1: using the LeafNode to statically define where something is rendered
//

const DemoStatic: React.FC = () => {
    const [settings, setSettings] = React.useState<{ hideTitles?: boolean }>({hideTitles: false})
    return <div className={'flex flex-wrap'}>
        {/* todo: the engine doesn't validate that decorators and render are compatible */}
        <LeafsProvider<CustomLeafPropsSpec>
            deco={deco}
            render={render}
            settings={settings}
        >
            <div className={'col-12'}>
                <button
                    onClick={() => setSettings(s => ({...s, hideTitles: !s.hideTitles}))}
                    className={'btn mb2'}
                >toggle titles
                </button>
            </div>
            <div className={'flex col-6'}>
                <LeafNode<CustomLeafPropsSpec, typeof deco, CustomLeafPropsSpec['paragraph']>
                    title={'Skill 01'}
                    type={'paragraph'}
                    value={{content: 'Skill 01 Lorem Ipsum', type: 'paragraph'}}
                    storePath={'/0'}
                />
            </div>
            <div className={'flex col-6'}>
                <LeafNode<CustomLeafPropsSpec, typeof deco, CustomLeafPropsSpec['paragraph']>
                    title={'Skill 02'}
                    type={'paragraph'}
                    value={{content: 'Skill 02 Lorem Ipsum', type: 'paragraph'}}
                    storePath={'/1'}
                />
            </div>
            {/* todo: without the explicit props, a mismatched nested-type and root-type don't cause an error */}
            <div className={'flex col-6'}>
                <StaticLeafNode<CustomLeafPropsSpec['paragraph']>
                    title={'Skill 03'}
                    type={'paragraph'}
                    value={{content: 'Skill 03 Lorem Ipsum', type: 'paragraph'}}
                    storePath={'/2'}
                />
            </div>
            <div className={'flex col-6'}>
                <LeafNode<CustomLeafPropsSpec>
                    title={'Skill X'}
                    id={'only-used-to-check-no-deco'}
                    type={'paragraph'}
                    value={{content: 'Skill X Lorem Ipsum', type: 'paragraph'}}
                    storePath={'/x'}
                />
            </div>
        </LeafsProvider>
    </div>
}

//
// 👉 Example 2: using the LeafNode (NOT props) to render a data-list
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
    // todo: the engine doesn't validate that decorators and render are compatible,
    //       and as the `deco` mustn't know about the Leafs in regard to circles,
    //       i think it is impossible to further guarantee deco+leafs are compatible
    //       - except maybe with a check using further generics on `LeafsProvider`
    const [settings, setSettings] = React.useState<{ hideTitles?: boolean }>({hideTitles: false})
    return <div className={'flex flex-column'}>
        <LeafsProvider<CustomLeafPropsSpec>
            deco={deco}
            render={render}
            settings={settings}
        >
            <button
                onClick={() => setSettings(s => ({...s, hideTitles: !s.hideTitles}))}
                className={'btn mb2 mra'}
            >toggle titles
            </button>
            {leafData.map((ld, i) =>
                <LeafNode<CustomLeafPropsSpec, typeof deco, CustomLeafPropsSpec[typeof ld.type]>
                    key={i}
                    // re-mapping data to props
                    {...{
                        // title is just some dummy for the decorators
                        title: 'Type ' + ld.type + ' No ' + i,
                        type: ld.type,
                        storePath: '/' + i,
                        value: ld,
                        // the "remove props injected by decorators" is also needed here
                    } as DecoratorProps<NonNullable<CustomLeafPropsSpec[typeof ld.type]>, typeof deco>}
                />)}
        </LeafsProvider>
    </div>
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
