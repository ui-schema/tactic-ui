import { Deco, DecoDataPluck, DecoDataResult, ExtractDecoPayload, ExtractDecoReturn } from '@tactic-ui/engine/Deco'

export interface DecoTW {
    storePath: string
}

const dec = new Deco<DecoTW>()
    .use(<P extends DecoTW>(p: P): DecoTW & { required: boolean } => ({...p, required: true}))
    .use(<P extends DecoTW & { required: boolean }>(p: P): DecoTW & { valid?: boolean } => ({...p, valid: false}))// when prev. missing, this must fail, when existing no `required` is allowed in `run`
// .use(<P extends DecoTW>(p: P & { required?: boolean }): DecoTW & { valid?: boolean } => ({...p, valid: false}))// when prev. missing, this P must be in PG
// .use(<P extends DecoTW & { required?: boolean }>(p: P): DecoTW & { valid?: boolean } => ({...p, valid: false}))// when prev. missing, this P must be in PG
// .use((p: DecoTW & { required?: boolean }): DecoTW & { valid?: boolean } => ({...p, valid: false}))
// .use((p) => ({...p}))

// "lazy" typings work also:
/*const dec = new Deco<DecoTW>()
    .use((p): { required: boolean } => ({...p, required: true}))// CASE: A
    .use((p: { required: boolean }): { valid?: boolean } => ({...p, valid: false}))// CASE: A
// .use(<P extends {}>(p: P & { required?: boolean }): { valid?: boolean } => ({...p, valid: false}))// CASE: B*/

export const r = dec.run({storePath: ''})

export const d0: ExtractDecoPayload<typeof dec> = {storePath: ''}
export const d1: ExtractDecoReturn<typeof dec> = {required: true}

export function decoFn<D extends {}, DCP extends Deco<{}, {}>>(dec: DCP, d0: DecoDataPluck<D, DCP>): DecoDataResult<D, DCP> {
// export function decoFn<DCP extends Deco<{}, {}>>(dec: DCP, d0: ExtractDecoProps<DCP>): ExtractDecoReturn<DCP> & ExtractDecoProps<DCP> {
    return dec.run(d0)
    // return dec.run(d0) as ExtractDecoProps<DCP>
}

export const r2 = decoFn<DecoTW, typeof dec>(dec, {storePath: ''})
// r2.valid
