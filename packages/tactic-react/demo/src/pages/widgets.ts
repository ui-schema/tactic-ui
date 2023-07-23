//
// The typing for decorators and widgets used in this tactic-ui demo implementation.
//

// 👉 1.1. very basic plugin props

export interface DemoDecoratorProps {
    title: string
    // keys: string[]
}

export interface DemoDecorator1ResultProps extends DemoDecoratorProps {
    id: string
}


// 👉 1.2. Define two types which will be used as base for props of all leafs
//    - one base typing: used for every other typing
//    - one base-props typing: based upon the first base and used for every `Leaf` to build the `props` automatically
//    - this must contain the meta data, like the properties which are used for "matching"
//    - for LeafEngines which provide data-bindings it should also contain e.g. `storeKeys` / `storePath` / `entityName`+`entityId`
//    - for strict typing mapping inside of the `Leaf`, add one generic param, which can be used for equality check,
//      the value must equal a `key` of `CustomLeafDataSpec`
export interface CustomLeafDataType<T extends string> {
    type: T
}

export type CustomLeafPropsWithValue<V extends CustomLeafDataType<string>> =
    {
        type: V['type']
        storePath: string
        value: V
    } &
    {
        dense?: boolean
    } &
    // include all props that should be available for the widgets
    DemoDecoratorProps &
    DemoDecorator1ResultProps

// 👉 2. Define further types which are specific to only some mappings
export interface CustomLeafDataOfContent {
    content: string
}

// 👉 3. Define a mapping of which "leaf type" should use which `LeafData` as specific values object
export interface CustomLeafDataSpec {
    // todo: maybe switch definition: first Deco, second Data/Props Specs -> reusing `Deco` for applying the plugin typing
    headline: CustomLeafDataType<'headline'> & CustomLeafDataOfContent
    paragraph: CustomLeafDataType<'paragraph'> & CustomLeafDataOfContent
    breakThematic: CustomLeafDataType<'breakThematic'>

    // this doesn't work together with non-compatible types, can't be typed "loose" without all to be "loose"
    // [k: string]: LeafData<string> & { content: string | number }
}

// 👉 4. Define a `props` typing map for React Components, this remaps the data mappings (which are now also props mappings)
//    - note: this will make something like: `(CustomLeafPropsSpec['headline'] | CustomLeafPropsSpec['paragraph'] | CustomLeafPropsSpec['breakThematic'])`

export type CustomLeafPropsSpec = {
    [NT in keyof CustomLeafDataSpec]: CustomLeafPropsWithValue<CustomLeafDataSpec[NT]>
}
