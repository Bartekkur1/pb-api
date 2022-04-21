const { getLogger, configure } = require('log4js');

configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'basic'
            }
        }
    },
    categories: {
        default: { appenders: ['out'], level: 'debug' }
    }
});

module.exports = getLogger();