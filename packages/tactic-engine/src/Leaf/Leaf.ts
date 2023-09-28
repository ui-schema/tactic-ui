// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type GenericLeafNode<P> = any

export type GenericLeafsDataSpec<D extends {} = {}> = { [k: string]: D }

export type LeafsNodeSpec<LN extends GenericLeafNode<LDS[keyof LDS]>, LDS extends GenericLeafsDataSpec> = {
    [NT in keyof LDS]: LN
}

export interface LeafsRenderMapping<
    TLeafsMapping extends {} = {},
    TComponentsMapping extends {} = {},
    /**
     * The match params should be wider than the params each leaf expects,
     * to improve portability of matcher to work with similar leafs,
     * as mostly the matcher should work for more leafs than initially known.
     *
     * @example
     *  if some leaf param is:      `{ type: 'headline' | 'input' }`
     *  the match params should be: `{ type: string }`
     */
    TMatchParams extends {} = {},
    /**
     * @experimental
     */
    TMatchResult = any,
    /**
     * @experimental
     */
    THooks extends {} = {},
> {
    // `components` are "static usable", which can implement any special logic
    components: TComponentsMapping
    // `leafs` are "generic usable" and should all work based on the general data-mapping
    leafs: TLeafsMapping
    // todo: again, as `leafs` is typed by component, not data + factory, the matchLeaf can't be inference here,
    //       improve together with the todos about LeafsEngine in LeafsEngine + LeafsContext
    // todo: improve return type, `TLeafsMapping[keyof TLeafsMapping]` would need a too strong / custom typed "render decorator"
    /**
     * Responsible to match leafs of this mapping.
     */
    // matchLeaf: <P extends TMatchParams>(params: P, leafs: TLeafsMapping) => TLeafsMapping[keyof TLeafsMapping]
    matchLeaf: <P extends TMatchParams>(params: P, leafs: TLeafsMapping) => TMatchResult

    // forbidden prop, to make safe for react
    children?: never
    // todo: add `events` and/or `hooks` for shared generic-logic;
    //       e.g. CodeMirror getHighlight()-extension would be a `hook` and Content-UI `selectContent` would be an `event`;
    //       the `leafs` data-mapping should be type-able "depends on `hook/event`" - again hard when in same mapping-interface;
    //       it would make more sense to add that as some type-based plugin/extension
    hooks?: THooks
}

