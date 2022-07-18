const { CommandInteraction, MessageEmbed } = require('discord.js');
const chalk = require('chalk');
const fetch = require('node-fetch');
const { steamapi_key } = require('../../config.json');

module.exports = {
    name: 'steamchecker',
    description: 'Checks for the asked information',
    options: [
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
            // userinfo SubCommand
            case 'user-info' : {
                const steamID = options.getString('steam64-id');
                // checking if the steam id is the right size
                if (steamID.length < 17) return interaction.reply({ embeds: [errorEmbed.setDescription(`steam id must be ${17 - steamID.length} numbers longer`)], ephemeral: true });
                if (steamID.length > 17) return interaction.reply({ embeds: [errorEmbed.setDescription(`steam id must be ${steamID.length - 17} numbers shorter`)], ephemeral: true });
                if (!steamID) return interaction.reply({ embeds: [errorEmbed.setDescription('Must enter a steamId')], ephemeral: true });
                // if it starts with 76 (like all steam id's do) it goes to the actual fetching
                if (steamID.startsWith('76')) {
                    try {
                        interaction.deferReply();
                        // fetching from the different api links
                        const GetPlayerSummaries = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamapi_key}&steamids=${steamID}`;
                        const GetOwnedGames = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamapi_key}&steamid=${steamID}&format=json`;
                        const GetFriendList = `http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steamapi_key}&steamid=${steamID}&relationship=friend`;
                        const GetPlayerBans = `http://api.steampowered.com/ISteamUser/GetPlayerBans/v0001/?key=${steamapi_key}&steamids=${steamID}`;
                        const GetBadges = `http://api.steampowered.com/IPlayerService/GetBadges/v0001/?key=${steamapi_key}&steamid=${steamID}&format=json`;
                        const getPlayer = await fetch(GetPlayerSummaries).then(res => res.json()).then(json => json['response']);
                        const getOwned = await fetch(GetOwnedGames).then(res => res.json()).then(json => json['response']);
                        const getFriends = await fetch(GetFriendList).then(res => res.json()).then(json => json['friendslist']);
                        const getbans = await fetch(GetPlayerBans).then(res => res.json()).then(json => json['players']['0']);
                        const badges = await fetch(GetBadges).then(res => res.json()).then(json => json['response']);
                        // converting unix time to date
                        const a = getPlayer['players']['0']['timecreated'] * 1000;
                        const format = {
                            day: 'numeric',
                            month: '2-digit',
                            year: 'numeric',
                          };
                        // Setting the value's by default private
                        let Status = 'Private';
                        let timeCreated = 'Private';
                        let gameCount = 'Private';
                        let totalFriends = 'Private';
                        let country = 'Private/Not selected';
                        let gameInfo = 'Private/Not playing';
                        let steamLevel = 'Private';
                        let steamXp = 'Private';
                        let levelProgression = 'Private';
                        let steamBadges = 'private';
                        // Changing the value once the data is found
                        if (getPlayer['players']['0']['personastate'] === 0) Status = 'Offline';
                        if (getPlayer['players']['0']['personastate'] === 1) Status = 'Online';
                        if (getPlayer['players']['0']['personastate'] === 2) Status = 'Busy';
                        if (getPlayer['players']['0']['personastate'] === 3) Status = 'Away';
                        if (getPlayer['players']['0']['personastate'] === 4) Status = 'Away';
                        if (getPlayer['players']['0']['personastate'] === 5) Status = 'looking to trade';
                        if (getPlayer['players']['0']['personastate'] === 6) Status = 'looking to play.';
                        if (getPlayer['players']['0']['timecreated']) timeCreated = new Date(a).toLocaleString('en-gb', format);
                        if (getOwned['game_count']) gameCount = getOwned['game_count'];
                        if (getPlayer['players']['0']['communityvisibilitystate'] === 3) totalFriends = getFriends['friends'].length;
                        if (getPlayer['players']['0']['loccountrycode']) country = getPlayer['players']['0']['loccountrycode'];
                        if (getPlayer['players']['0']['gameextrainfo']) gameInfo = getPlayer['players']['0']['gameextrainfo'];
                        if (badges['player_xp']) {
                            const currentXp = badges['player_xp'] - badges['player_xp_needed_current_level'];
                            steamBadges = badges['badges'].length;
                            steamXp = badges['player_xp'];
                            steamLevel = badges['player_level'];
                            levelProgression = `${currentXp} / ${badges['player_xp_needed_to_level_up']}`;
                        }
                        // Creating the embed
                        succesEmbed
                            // title
                            .setTitle(`${getPlayer['players']['0']['personaname']}'s steam stats`)
                            // line 1
                            .addFields({ name: 'Status', value: `${Status}`, inline: true })
                            .addFields({ name: 'Account created', value: `${timeCreated}`, inline: true })
                            .addFields({ name: 'Friends', value: `${totalFriends}`, inline: true })
                            // line 2
                            .addFields({ name: 'Owned games', value: `${gameCount}`, inline: true })
                            .addFields({ name: 'Country', value: `${country}` || 'Not Selected', inline: true })
                            .addFields({ name: 'Badges', value: `${steamBadges}`, inline: true })
                            // line 3
                            .addFields({ name: 'VAC bans', value: `${getbans['NumberOfVACBans']}`, inline: true })
                            .addFields({ name: 'Game bans', value: `${getbans['NumberOfGameBans']}`, inline: true })
                            .addFields({ name: 'Economy bans', value: `${getbans['EconomyBan']}`, inline: true })
                            // line 4
                            .addFields({ name: 'Steam Level', value: `${steamLevel}`, inline: true })
                            .addFields({ name: 'Steam XP', value: `${steamXp}`, inline: true })
                            .addFields({ name: 'Level Progression', value: `${levelProgression}`, inline: true })
                            // line 5
                            .addFields({ name: 'Current Playing', value: `${gameInfo}`, inline: true })
                            // thumbnail
                            .setThumbnail(getPlayer['players']['0']['avatarfull'])
                            // url
                            .setURL(getPlayer['players']['0']['profileurl'])
                            // footer
                            .setFooter({ text: `Fetched from steam api || ${getPlayer['players']['0']['steamid']}` });
                        // Replying to the interaction
                        interaction.editReply({ embeds: [succesEmbed] });
                    }
                    catch (e) {
                        // If the try statement fails. It replies with this instead
                        interaction.reply({ embeds: [errorEmbed.setDescription('could not fetch this steam user')], ephemeral: true });
                        console.log(e);
                    }
                }
                else {
                    // If the steam id was invalid, It replies with this instead
                    interaction.reply({ embeds: [errorEmbed.setDescription('must enter a valid steamId')], ephemeral: true });
                }
            }
            break;
            // help SubCommand
            case 'help' : {
                // Creating the help embed
                succesEmbed
                .setTitle('Help Command')
                .addFields({ name: '/user-info', value: 'Fetching steam user data by steam id\nSteam id can be obtained by running the /finding-steamid command' })
                .addFields({ name: '/finding-steamid', value: 'Finds your steamID making use of your [steam](https://store.steampowered.com/) profile url. Can be obtained going to your steam profile page and copy the url' })
                .addFields({ name: '\u200b\u200b\u200b', value: '\u200b\u200b\u200b' })
                .addFields({ name: 'License', value: 'This discord system has been made by [Bart435](https://github.com/Bart435)' });
                // Sending the help embed
                interaction.reply({ embeds: [succesEmbed], ephemeral: true });
            }
            break;
            // Finding steamid SubCommand
            case 'finding-steamid' : {
                let vanityLink = options.getString('profile-url');
                // Checks if it a regular url
                if (vanityLink.startsWith('https://steamcommunity.com/profiles/')) {
                    // Splitting of the unnessary value of the url
                    vanityLink = vanityLink.split('https://steamcommunity.com/profiles/')[1].split('/')[0];
                    // Making sure that the id is the actual id
                    if (vanityLink.startsWith('76')) {
                        if (vanityLink.length < 17) return interaction.reply({ embeds: [errorEmbed.setDescription('Profile link invalid')], ephemeral: true });
                        if (vanityLink.length > 17) return interaction.reply({ embeds: [errorEmbed.setDescription('Profile link invalid')], ephemeral: true });
                        // Reply with the steamID
                        interaction.reply({ embeds: [succesEmbed.setDescription(`SteamID bounded to this url is ${vanityLink}`)], ephemeral: true });
                    }
                }
                // Check if it is a vanity url
                else if (vanityLink.startsWith('https://steamcommunity.com/id/')) {
                    // Splitting of the unnessary value of the url
                    vanityLink = vanityLink.split('https://steamcommunity.com/id/')[1].split('/')[0];
                    try {
                        // fetching the steamID
                        const ResolveVanityURL = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamapi_key}&vanityurl=${vanityLink}`;
                        const steamId = await fetch(ResolveVanityURL).then(res => res.json()).then(json => json['response']);
                        if (!steamId['steamid']) return interaction.reply({ embeds: [errorEmbed.setDescription('Could not find a user with this profile url')], ephemeral: true });
                        // Reply with the steamID
                        interaction.reply({ embeds: [succesEmbed.setDescription(`SteamID bounded to this url is ${steamId['steamid']}`)], ephemeral: true });
                    }
                    catch (err) {
                        // Incase it fails
                        interaction.reply({ embeds: [errorEmbed.setDescription('could not fetch this steam user')], ephemeral: true });
                        console.log(chalk.red(err));
                    }
                }
                else {
                    // When the profile links don't contain the nessecary value's
                    interaction.reply({ embeds: [errorEmbed.setDescription('Must be a profile link, examples \n(https://steamcommunity.com/id/)\n(https://steamcommunity.com/profiles/)')], ephemeral: true });
                }
            }
            break;
            // the default if other fail
            default : {
                console.log(chalk.red('An error occured in the stat checker command.'));
            }
        }
    },
};