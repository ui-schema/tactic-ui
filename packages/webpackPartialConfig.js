
const path = require('path');

module.exports = {
    resolve: {
        alias: {
            '@tactic-ui/react': path.resolve(__dirname, './tactic-react/src'),
'@tactic-ui/engine': path.resolve(__dirname, './tactic-engine/src'),
'@tactic-ui/vanilla': path.resolve(__dirname, './tactic-vanilla/src'),

        }
    }
}