const { Events } = require('../Validation/EventNames');
const { showLoadedEvents } = require('../configs/handlerSettings.json');
const chalk = require('chalk');
module.exports = async (client, PG) => {
    console.log(chalk.yellow('Events loaded'));

    (await PG(`${(process.cwd().replace(/\\/g, '/'))}/src/events/*.js`)).map(async (file) => {
        const event = require(file);
        if (!Events.includes(event.name) || !event.name) {
            const L = file.split('/');
            console.log(`${event.name || 'MISSING'}`, `⛔ Event name is either invalid or missing: ${L[5] + '/' + L[6]}`);
            return;
        }

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }

        if (showLoadedEvents) {
            console.log(`${event.name} 🔹 SUCCESFULL`);
        }
    });
};