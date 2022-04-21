const { getLogger, configure } = require('log4js');

configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'basic'
            }
        },
        file: {
            type: 'file',
            filename: 'ignis.log'
        }
    },
    categories: {
        default: { appenders: ['out', 'file'], level: 'debug' }
    }
});

module.exports = getLogger();