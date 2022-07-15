const { CommandInteraction, MessageEmbed, Client } = require('discord.js');
const chalk = require('chalk');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
    name: 'steamchecker',
    description: 'Checks for the asked information',
    options: [
        // SubCommand for game news
        {
            name: 'game-news',
            description: 'Gets news from a game',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'appid',
                    description: 'Provid a valid app id to fetch from',
                    type: 'STRING',
                    required: true,
                },
            ],
        },
        // // SubCommand for user information
        {
            name: 'user-info',
            description: 'Gets information about a user',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'steam64-id',
                    description: 'Provide the steam id of the target user',
                    type: 'STRING',
                    required: true,
                },
                {
                    name: 'option',
                    description: 'Select an option',
                    type: 'STRING',
                    required: true,
                    choices: [
                        {
                            name: 'overview',
                            value: 'overview',
                        },
                        {
                            name: 'game-stats',
                            value: 'game-stats',
                        },
                        {
                            name: 'owned-games',
                            value: 'owned-games',
                        },
                        {
                            name: 'recently-played',
                            value: 'recently-played',
                        },
                    ],
                },
            ],
        },
    ],
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} Client
     */
    execute(interaction, client) {
        const { options } = interaction;
        const subCommands = options.getSubcommand();
        const apiKey = process.env.STEAMAPI_KEY;

        const errorEmbed = new MessageEmbed().setColor('RED');
        const succesEmed = new MessageEmbed().setColor('GREEN');

        switch (subCommands) {
            case 'game-news' : {
                const appid = options.getString('appid');
            }
            break;

            case 'user-info' : {
                const steamID = options.getString('steam64-id');
                const option = options.getString('option');
                switch (option) {
                    case 'overview' : {
                        interaction.reply ({ content: 'overview' });
                    }
                    break;
                    case 'game-stats' : {
                        interaction.reply ({ content: 'game-stats' });
                    }
                    break;
                    case 'owned-games' : {
                        interaction.reply ({ content: 'owner-games' });
                    }
                    break;
                    case 'recently-played' : {
                        interaction.reply ({ content: 'recently-played' });
                    }
                    break;
                    default : {
                        console.log(chalk.red('An error occured'));
                    }
                }
            }
            break;
            default : {
                console.log(chalk.red('An error occured in the stat checker command.'));
            }
        }
    },
};