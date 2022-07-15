const { Perms } = require('../Validation/Permissions');
const { showLoadedCommands } = require('../configs/handlerSettings.json');
const chalk = require('chalk');
/**
 *  @param {Client} client
 */
module.exports = async (client, PG) => {
    console.log(chalk.yellow('Commands loaded'));

    const CommandsArray = [];

    (await PG(`${(process.cwd().replace(/\\/g, '/'))}/src/commands/*.js`)).map(async (file) => {
        const command = require(file);

        if (!command.name) {
            console.log(`${file.split('/')[7]} 🔸 Missing a name.`);
        }

        if (!command.context && !command.description) {
            console.log(`${command.name} 🔸 missing a description.`);
        }

        client.commands.set(command.name, command);
        CommandsArray.push(command);
        if (showLoadedCommands) {
            console.log(`${command.name} 🔹 SUCCESFULL`);
        }
    });

// setting the commands on ready and guildCreate

    function setCommands() {
        client.guilds.cache.forEach((g) => {
            g.commands.set(CommandsArray);
        });
    }
    client.on('ready', async () => {
        setCommands();
    });
    client.on('guildCreate', async () => {
        setCommands();
    });
};