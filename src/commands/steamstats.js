const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("steamstats")
        .setDescription("get's steam stats")
        .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
        .addStringOption(option => option.setName('steamid').setDescription('State the steam 64 id that you want to receive information from.').setRequired(true)),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const steamID = interaction.options.getString("steamid");
        const errorEmbed = new EmbedBuilder().setColor("Red");
        const succesEmbed = new EmbedBuilder().setColor("Green");

        if (!steamID) return interaction.reply({ embeds: [errorEmbed.setDescription('Must enter a steamId')], ephemeral: true });

        if (steamID.startsWith('76') && steamID.length == 17) {
            try {
                const urls = {
                    getPlayer: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${client.config.steamapi_key}&steamids=${steamID}`,
                    getOwned: `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${client.config.steamapi_key}&steamid=${steamID}&format=json`,
                    getFriends: `http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${client.config.steamapi_key}&steamid=${steamID}&relationship=friend`,
                    getbans: `http://api.steampowered.com/ISteamUser/GetPlayerBans/v0001/?key=${client.config.steamapi_key}&steamids=${steamID}`,
                    badges: `http://api.steampowered.com/IPlayerService/GetBadges/v0001/?key=${client.config.steamapi_key}&steamid=${steamID}&format=json`
                }

                const getPlayer = await fetch(urls.getPlayer).then(res => res.json()).then(json => json['response']);
                const getOwned = await fetch(urls.getOwned).then(res => res.json()).then(json => json['response']);
                const getFriends = await fetch(urls.getFriends).then(res => res.json()).then(json => json);
                const getbans = await fetch(urls.getbans).then(res => res.json()).then(json => json['players']['0']);
                const badges = await fetch(urls.badges).then(res => res.json()).then(json => json['response']);

                const a = getPlayer['players']['0']['timecreated'] * 1000;
                const format = {
                    day: 'numeric',
                    month: '2-digit',
                    year: 'numeric',
                };

                const account = {
                    Status: 'Private',
                    timeCreated: 'Private',
                    gameCount: 'Private',
                    totalFriends: 'Private',
                    country: 'Private/Not selected',
                    gameInfo: 'Private/Not playing',
                    steamLevel: 'Private',
                    steamXp: 'Private',
                    levelProgression: 'Private',
                    steamBadges: 'Private'
                }

                const personastate = ['offline', 'online', 'busy', 'away', 'snooze', 'looking to trade', 'looking to play']
                account.Status = personastate[getPlayer['players']['0']['personastate']] !== undefined ? personastate[getPlayer['players']['0']['personastate']] : 0

                if (getPlayer['players']['0']['timecreated']) account.timeCreated = new Date(a).toLocaleString('en-gb', format);
                if (getOwned['game_count']) account.gameCount = getOwned['game_count'];
                if (getFriends['friendslist']) account.totalFriends = getFriends['friendslist']['friends'].length;
                if (getPlayer['players']['0']['loccountrycode']) account.country = getPlayer['players']['0']['loccountrycode'];
                if (getPlayer['players']['0']['gameextrainfo']) account.gameInfo = getPlayer['players']['0']['gameextrainfo'];
                if (badges['player_xp']) {
                    account.steamBadges = badges['badges'].length;
                    account.steamXp = badges['player_xp'];
                    account.steamLevel = badges['player_level'];
                }

                succesEmbed
                    .setTitle(`${getPlayer['players']['0']['personaname']}'s stats`)
                    .addFields(
                        { name: 'Status', value: `${account.Status}`, inline: true },
                        { name: 'Account created', value: `${account.timeCreated}`, inline: true },
                        { name: 'Friends', value: `${account.totalFriends}`, inline: true },
                        { name: 'Owned games', value: `${account.gameCount}`, inline: true },
                        { name: 'Country', value: `${account.country}` || 'Not Selected', inline: true },
                        { name: 'Badges', value: `${account.steamBadges}`, inline: true },
                        { name: 'VAC bans', value: `${getbans['NumberOfVACBans']}`, inline: true },
                        { name: 'Game bans', value: `${getbans['NumberOfGameBans']}`, inline: true },
                        { name: 'Economy bans', value: `${getbans['EconomyBan']}`, inline: true },
                        { name: 'Steam Level', value: `${account.steamLevel}`, inline: true },
                        { name: 'Steam XP', value: `${account.steamXp}`, inline: true },
                        { name: 'Currently Playing', value: `${account.gameInfo}`, inline: true },
                    )
                    .setThumbnail(getPlayer['players']['0']['avatarfull'])
                    .setURL(getPlayer['players']['0']['profileurl'])
                    .setFooter({ text: `Fetched from steam api || ${getPlayer['players']['0']['steamid']}` });
                interaction.reply({ embeds: [succesEmbed] });
            }
            catch (err) {
                console.log(err)
                interaction.reply({ embeds: [errorEmbed.setDescription("Couldn't fetch this user.")], ephemeral: true });
            }
        }
        else {
            interaction.reply({ embeds: [errorEmbed.setDescription('must enter a valid steamId.')], ephemeral: true });
        }
    },
};