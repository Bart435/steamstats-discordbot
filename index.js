const { Client, Collection } = require('discord.js');
const client = new Client({ intents: 32767 });
const { promisify } = require('util');
const { glob } = require('glob');
const PG = promisify(glob);
const Ascii = require('ascii-table');
const chalk = require('chalk');
const { errorMsg, unhandledRejectionMsg, uncaughtExceptionMsg, uncaughtExceptionMonitorMsg, multipleResolvesMsg, warningMsg } = require('./src/configs/errorMessage.json');
require('dotenv').config();

client.commands = new Collection();

['Events', 'Commands'].forEach(handler => {
    require(`./src/Handlers/${handler}`)(client, PG, Ascii);
});

// error checks
client.on('error', err => {
    if (errorMsg) {
        console.log(chalk.red(err));
    }
    else {
        console.log(chalk.red('An error occured'));
    }
});
process.on('unhandledRejection', (reason, p) => {
    if (unhandledRejectionMsg) {
        console.log(chalk.red(reason, p));
    }
    else {
        console.log(chalk.red('An error occured'));
    }
});
process.on('uncaughtException', (err, origin) => {
    if (uncaughtExceptionMsg) {
        console.log(chalk.red(err, origin));
    }
    else {
        console.log(chalk.red('An error occured'));
    }
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
    if (uncaughtExceptionMonitorMsg) {
        console.log(chalk.red(err, origin));
    }
    else {
        console.log(chalk.red('An error occured'));
    }
});
process.on('multipleResolves', (type, promise, reason) => {
    if (multipleResolvesMsg) {
        console.log(chalk.red(type, promise, reason));
    }
    else {
        console.log(chalk.red('An error occured'));
    }
});
process.on('warning', (warn) => {
    if (warningMsg) {
        console.log(chalk.blue(warn));
    }
});

client.login(process.env.DISCORD_TOKEN);
