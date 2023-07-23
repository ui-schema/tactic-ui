// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type GenericLeafNode<P> = any

export type GenericLeafsDataSpec = { [k: string]: {} }

export type LeafsNodeSpec<LN extends GenericLeafNode<LDS[keyof LDS]>, LDS extends GenericLeafsDataSpec> = {
    [NT in keyof LDS]: LN
}

export interface LeafsRenderMapping<LNS extends {} = {}, CC extends {} = {}> {
    // `components` are "static usable", which can implement any special logic
    components: CC
    // `leafs` are "generic usable" and should all work based on the general data-mapping
    leafs: LNS
    // forbidden prop, to make safe for react
    children?: never
    // todo: add `events` and/or `hooks` for shared generic-logic;
    //       e.g. CodeMirror getHighlight()-extension would be a `hook` and Content-UI `selectContent` would be an `event`;
    //       the `leafs` data-mapping should be type-able "depends on `hook/event`" - again hard when in same mapping-interface;
    //       it would make more sense to add that as some type-based plugin/extension

}

