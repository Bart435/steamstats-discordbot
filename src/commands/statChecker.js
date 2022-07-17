const { CommandInteraction, MessageEmbed, Client } = require('discord.js');
const chalk = require('chalk');
const fetch = require('node-fetch');
const { inlineCode } = require('@discordjs/builders');
const { steamapi_key } = require('../../config.json');

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
        // SubCommand for user information
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
            ],
        },
        // SubCommand for help
        {
            name: 'help',
            description: 'Explains this command',
            type: 'SUB_COMMAND',
        },
        // SubCommand for finding steamid's
        {
            name: 'finding-steamid',
            description: 'Helps you retreive your or others steam id',
            type: 'SUB_COMMAND',
            options: [
                {
                    name: 'profile-url',
                    description: 'Provide the steam profile url',
                    type: 'STRING',
                    required: true,
                },
            ],
        },
    ],
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} Client
     */
    async execute(interaction, client) {
        const { options } = interaction;
        const subCommands = options.getSubcommand();

        const errorEmbed = new MessageEmbed().setColor('RED');
        const succesEmbed = new MessageEmbed().setColor('GREEN');

        switch (subCommands) {
            // Game news SubCommand
            case 'game-news' : {
                const appid = options.getString('appid');
            }
            break;
            // userinfo SubCommand
            case 'user-info' : {
                const steamID = options.getString('steam64-id');
                // checking if the steam id is the right size
                if (steamID.length < 17) return interaction.reply({ content: 'steamId invalid' });
                if (steamID.length >= 18) return interaction.reply({ content: 'steamId invalid' });
                if (!steamID) return interaction.reply({ content: 'Must enter a steamId' });
                // if it starts with 76 (like all steam id's do) it goes to the actual fetching
                if (steamID.startsWith('76')) {
                    try {
                        // fetching for the 4 different api links
                        const GetPlayerSummaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamapi_key}&steamids=${steamID}`;
                        const GetOwnedGames = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamapi_key}&steamid=${steamID}&format=json`;
                        const GetFriendList = `http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steamapi_key}&steamid=${steamID}&relationship=friend`;
                        const GetRecentlyPlayedGames = `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamapi_key}&steamid=${steamID}&format=json`;
                        const getPlayer = await fetch(GetPlayerSummaries).then(res => res.json()).then(json => json['response']);
                        const getOwned = await fetch(GetOwnedGames).then(res => res.json()).then(json => json['response']);
                        const getFriends = await fetch(GetFriendList).then(res => res.json()).then(json => json['friendslist']);
                        const GetPlayed = await fetch(GetRecentlyPlayedGames).then(res => res.json()).then(json => json['response']);
                        // setting the users status
                        let Status = 'Offline';
                        if (getPlayer['players']['0']['communityvisibilitystate'] === 1) return interaction.reply({ content: 'Profile is private' });
                        if (getPlayer['players']['0']['personastate'] === 0) Status = 'Offline';
                        if (getPlayer['players']['0']['personastate'] === 1) Status = 'Online';
                        if (getPlayer['players']['0']['personastate'] === 2) Status = 'Busy';
                        if (getPlayer['players']['0']['personastate'] === 3) Status = 'Away';
                        if (getPlayer['players']['0']['personastate'] === 4) Status = 'Away';
                        if (getPlayer['players']['0']['personastate'] === 5) Status = 'looking to trade';
                        if (getPlayer['players']['0']['personastate'] === 6) Status = 'looking to play.';
                        const a = getPlayer['players']['0']['timecreated'] * 1000;
                        const format = {
                            day: 'numeric',
                            month: '2-digit',
                            year: 'numeric',
                          };
                        const timeCreated = inlineCode(new Date(a).toLocaleString('en-gb', format));
                        succesEmbed
                            // title
                            .setTitle(`${getPlayer['players']['0']['personaname']}'s stats`)
                            // line 1
                            .addFields({ name: 'Owned games', value: `${getOwned['game_count']}`, inline: true })
                            .addFields({ name: 'Account created', value: `${timeCreated}`, inline: true })
                            .addFields({ name: 'Friends', value: `${getFriends['friends'].length}`, inline: true })
                            // line 2
                            .addFields({ name: 'Status', value: `${Status}`, inline: true })
                            .addFields({ name: 'Steam ID', value: `${getPlayer['players']['0']['steamid']}`, inline: true })
                            .addFields({ name: 'Country', value: `${getPlayer['players']['0']['loccountrycode']}` || 'Not Selected', inline: true })
                            // line 3
                            .addFields({ name: 'Current Playing', value: `${getPlayer['players']['0']['gameextrainfo']}` || 'None', inline: true })
                            // thumbnail
                            .setThumbnail(getPlayer['players']['0']['avatarfull'])
                            // url
                            .setURL(getPlayer['players']['0']['profileurl'])
                            // footer
                            .setFooter({ text: 'Fetched from steam api' });
                        interaction.reply({ embeds: [succesEmbed] });
                    }
                    catch (e) {
                        errorEmbed.setDescription('could not fetch this steam user');
                        interaction.reply({ embeds: [errorEmbed] });
                        console.log(e);
                    }
                }
                else {
                    interaction.reply({ content: 'must enter a valid steamId' });
                }
            }
            break;
            // help SubCommand
            case 'help' : {
                console.log('test');
            }
            break;
            // Finding steamid SubCommand
            case 'finding-steamid' : {
                console.log('test');
            }
            break;
            // the default if other fail
            default : {
                console.log(chalk.red('An error occured in the stat checker command.'));
            }
        }
    },
};