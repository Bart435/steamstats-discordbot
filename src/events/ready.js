const { Client } = require('discord.js');
const chalk = require('chalk');
module.exports = {
    name: 'ready',
    once: true,
    /**
    *  @param {Client} client
    */
    async execute(client) {
        console.log(chalk.yellow('Client is ready!'));
    },
};