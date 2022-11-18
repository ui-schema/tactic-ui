// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type GenericLeafNode<P> = any

export type GenericLeafsDataSpec = { [k: string]: {} }

export type LeafsNodeSpec<LN extends GenericLeafNode<LDS[keyof LDS]>, LDS extends GenericLeafsDataSpec> = {
    [NT in keyof LDS]: LN
}
