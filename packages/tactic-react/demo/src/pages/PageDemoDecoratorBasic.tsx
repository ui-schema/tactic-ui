import { ReactDeco, DecoratorProps, DecoratorPropsNext, DecoratorNextFn, ReactBaseDecorator } from '@tactic-ui/react/Deco'
import React from 'react'
import { Typo } from '../components/Styles.js'
import { createLeafContext, defineLeafEngine, GenericLeafsDataSpec, LeafsRenderMapping, ReactLeafsNodeSpec } from '@tactic-ui/react/LeafsEngine'
import { CustomLeafDataSpec, CustomLeafDataType, CustomLeafPropsSpec, CustomLeafPropsWithValue, DemoDecoratorProps, DemoDecorator1ResultProps } from './leafs.js'


// 👉 1. to 4. are in `leafs.ts`
//
//
// 👉 5.1. Create a custom render engine out of the parts

type CustomLeafsNodeSpec = ReactLeafsNodeSpec<CustomLeafPropsSpec>
type CustomComponents = {
    Container?: React.ComponentType<React.PropsWithChildren<{}>>
}
type CustomLeafsRenderMapping<
    TLeafsMapping extends {} = {},
    TComponentsMapping extends {} = {},
> = LeafsRenderMapping<TLeafsMapping, TComponentsMapping>


const context = createLeafContext<
    GenericLeafsDataSpec, CustomComponents,
    ReactDeco<{}, {}>,
    LeafsRenderMapping<ReactLeafsNodeSpec<GenericLeafsDataSpec>, CustomComponents>
>()

const {
    LeafsProvider, useLeafs,
} = defineLeafEngine(context)

// a custom context, used as example for props injection in the `LeafNode`

export interface SettingsContextType {
    hideTitles?: boolean
}

const settingsContext = React.createContext<SettingsContextType>({hideTitles: false})

// 👉 5.2. Create a custom LeafNode which maps the properties, decorators and handles the rendering

type LeafNodeInjected = 'decoIndex' | 'next' | 'settings' | keyof ReturnType<typeof useLeafs>

function LeafNode<
    TLeafsDataMapping extends GenericLeafsDataSpec,
    TDeco extends ReactDeco<{}, {}> = ReactDeco<{}, {}>,
    TLeafData extends TLeafsDataMapping[keyof TLeafsDataMapping] = TLeafsDataMapping[keyof TLeafsDataMapping],
    TComponentsMapping extends {} = {},
    TRender extends LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponentsMapping> = LeafsRenderMapping<ReactLeafsNodeSpec<TLeafsDataMapping>, TComponentsMapping>,
    // todo: TProps not only needs to support removing injected, but also allowing overriding those injected
    TProps extends DecoratorProps<NonNullable<TLeafData>, TDeco> = DecoratorProps<NonNullable<TLeafData>, TDeco>,
>(
    props: Omit<TProps, LeafNodeInjected>, // remove the props injected by LeafNode
): React.JSX.Element | null {
    const {deco, renderMap} = useLeafs<TLeafsDataMapping, TComponentsMapping, TDeco, TRender>()
    if(!deco) {
        throw new Error('This LeafNode requires decorators, maybe missed `deco` at the `LeafsProvider`?')
    }
    const settings = React.useContext(settingsContext)

    // `Next` can not be typed in any way I've found (by inferring),
    // as the next decorator isn't yet known, only when wiring up the Deco,
    // thus here no error will be shown, except the safeguard that "all LeafNode injected are somehow passed down".
    const Next = deco.next(0) as ReactBaseDecorator<{ [k in LeafNodeInjected]: any }>
    return <Next
        {...props}
        deco={deco}
        renderMap={renderMap}
        next={deco.next}
        settings={settings}
        decoIndex={0}
    />
}

// an alternative for a more strict working LeafNode, with more baked in
const StrictLeafNode = LeafNode as
    (<D2 extends CustomLeafPropsSpec[keyof CustomLeafPropsSpec]>(
        props: Omit<DecoratorProps<NonNullable<D2>, typeof deco>, LeafNodeInjected>,
    ) => React.JSX.Element | null)

// another alternative for a more strict working LeafNode, with more baked in,
// and using a "key prop strategy" for type inferring; the `type` property is defined in `CustomLeafDataType`;
const StrictKeyPropLeafNode = LeafNode as
    (<K extends keyof CustomLeafPropsSpec, P extends CustomLeafPropsSpec[K] = CustomLeafPropsSpec[K]>(
        props: Omit<DecoratorProps<NonNullable<P>, typeof deco>, LeafNodeInjected>,
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
    const Next = p.next(p.decoIndex + 1)
    return <Next
        {...p}
        id={p.title.toLowerCase().replace(/[ .-]/g, '_')}
        decoIndex={p.decoIndex + 1}
    />
}

//
// 💎 the renderer - is also a decorator!
//

type DemoRendererProps = {
    // todo: try to make the render typing a bit stricter without circular CustomLeafProps import dependencies
    renderMap: CustomLeafsRenderMapping<ReactLeafsNodeSpec<{ [k: string]: {} }>, CustomComponents>
    type: string
    settings: SettingsContextType
}

function DemoRenderer<P extends DecoratorPropsNext>(
    {
        renderMap,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next,
        // todo: shouldn't `settings` be passed down here? maybe that is the solution to check for compat at the end,
        //       using the end result to check against the requirements of all leaf-props (in provider only)
        settings,
        ...p
    }: P & DemoDecoratorProps & { id: string } & DemoRendererProps,
): React.ReactElement<P> {
    // the last decorator must end the run - decorators afterwards are skipped silently
    const Leaf = renderMap.leafs[p.type] as any

    return <div className={'mb2'}>
        {settings?.hideTitles ? null : <>
            <p className={'my0 body2'}>id: <code>{p.id}</code></p>
            <p className={'my0 body2'}>title: <code>{p.title}</code></p>
        </>}

        <Leaf {...p}/>
    </div>
}

function DebugDecorator<P extends { decoIndex: number, next: DecoratorNextFn<{ debug: true }> }>(p: P & { id: string }): React.ReactElement<P & { debug: true }> {
    const Next = p.next(p.decoIndex + 1)
    console.log('DebugDecorator', p.id, Next)
    return <Next
        {...p}
        decoIndex={p.decoIndex + 1}
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
    { settings: SettingsContextType } &
    {
        renderMap: CustomLeafsRenderMapping<ReactLeafsNodeSpec<{ [k: string]: {} }>, CustomComponents>
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

const BreakThematic: React.ComponentType<CustomLeafPropsWithValue<CustomLeafDataType<'breakThematic'>>> =
    (props) => <hr title={props.storePath} style={{width: '100%'}}/>

const leafs: CustomLeafsNodeSpec = {
    headline: (props) => props.value.type === 'headline' ? <Typo component={'h3'} title={props.storePath}>{props.value.content || null}</Typo> : null,
    paragraph: (props) => props.value.type === 'paragraph' ? <Typo component={'p'} title={props.storePath}>{props.value.content || null}</Typo> : null,
    breakThematic: BreakThematic,
}

/**
 * An example component using `React.ComponentType`, which somehow makes problems externally
 */
const ContainerComponent: React.ComponentType<React.PropsWithChildren<{}>> = ({children}) => {
    return <div className={'container container-md'}>{children}</div>
}

const renderMap: CustomLeafsRenderMapping<CustomLeafsNodeSpec, CustomComponents> = {
    leafs: leafs,
    components: {
        Container: ContainerComponent,
    },
}

//
// 👉 Example 1: using the LeafNode to statically define where something is rendered
//

const DemoStatic: React.FC = () => {
    const [settings, setSettings] = React.useState<{ hideTitles?: boolean }>({hideTitles: false})
    return <div className={'flex flex-wrap'}>
        {/* todo: the engine doesn't validate that decorators and renderMap are compatible */}
        <settingsContext.Provider value={settings}>
            <LeafsProvider<CustomLeafPropsSpec>
                deco={deco}
                renderMap={renderMap}
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
                    <StrictLeafNode<CustomLeafPropsSpec['paragraph']>
                        title={'Skill 03'}
                        type={'paragraph'}
                        value={{content: 'Skill 03 Lorem Ipsum', type: 'paragraph'}}
                        storePath={'/2'}
                    />
                </div>
                <div className={'flex col-6'}>
                    {/* todo: here the "const typing" is enough to correctly validate the nested data */}
                    <StrictKeyPropLeafNode<'paragraph'>
                        title={'Skill 04'}
                        type={'paragraph'}
                        value={{content: 'Skill 04 Lorem Ipsum', type: 'paragraph'}}
                        storePath={'/3'}
                    />
                </div>
                <div className={'flex col-8 mxa'}>
                    <LeafNode<CustomLeafPropsSpec>
                        title={'Skill X'}
                        id={'only-used-to-check-no-deco'}
                        type={'paragraph'}
                        value={{content: 'Skill X Lorem Ipsum', type: 'paragraph'}}
                        storePath={'/x'}
                    />
                </div>
            </LeafsProvider>
        </settingsContext.Provider>
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
    //       and as the `deco` mustn't know about the Leafs in regard to circular dependencies,
    //       i think it is impossible to further guarantee deco+leafs are compatible
    //       - except maybe with a check using further generics on `LeafsProvider`
    const [settings, setSettings] = React.useState<{ hideTitles?: boolean }>({hideTitles: false})

    return <div className={'flex flex-column'}>
        <settingsContext.Provider value={settings}>
            <LeafsProvider<CustomLeafPropsSpec>
                deco={deco}
                renderMap={renderMap}
                // settings={settings}
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
        </settingsContext.Provider>
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
