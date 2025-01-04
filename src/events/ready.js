const { checkCanary } = require('../utils/canaryChecker');
const cron = require('node-cron');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('Bot is ready!');
        
        // schedule daily check at 12:00 PM
        cron.schedule('0 12 * * *', () => {
            checkCanary(client);
        });
        
        // initial check
        checkCanary(client);
    }
};
