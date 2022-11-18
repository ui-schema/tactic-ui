import process from 'process'
import boot from './boot.js'
import { testCommand } from './commands/testCommand.js'
import { pointerCommand } from './commands/pointerCommand.js'

(() => {
    boot()

    const fullArgs = process.argv.slice(2)
    const [command, ...opts] = fullArgs
    switch (command) {
        case 'hello':
            console.log('hello world')
            break
        case 'validate':
            testCommand(opts[0])
                .then(() => undefined)
            break
        case 'pointer':
            pointerCommand()
                .then(() => undefined)
            break
        default:
            console.error('Command not found')
            break
    }
})()
