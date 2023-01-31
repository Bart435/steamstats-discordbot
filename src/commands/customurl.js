const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile-url")
        .setDescription("Converts profile url to steam64 id")
        .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands)
        .addStringOption(option => option.setName('profile-url').setDescription('State the profile url that you want to convert to steamid').setRequired(true)),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const errorEmbed = new EmbedBuilder().setColor("Red");
        const succesEmbed = new EmbedBuilder().setColor("Green");
        let profileURL = interaction.options.getString('profile-url');
        if (profileURL.startsWith('https://steamcommunity.com/profiles/')) {

            profileURL = profileURL.split('https://steamcommunity.com/profiles/')[1].split('/')[0];

            if (profileURL.startsWith('76')) {
                if (!profileURL.length == 17) return interaction.reply({ embeds: [errorEmbed.setDescription('Profile url invalid')], ephemeral: true });
                interaction.reply({ embeds: [succesEmbed.setDescription(`SteamID bounded to this url is ${profileURL}`)], ephemeral: true });
            }
        }
        else if (profileURL.startsWith('https://steamcommunity.com/id/')) {
            profileURL = profileURL.split('https://steamcommunity.com/id/')[1].split('/')[0];
            try {
                const ResolveVanityURL = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${client.config.steamapi_key}&vanityurl=${profileURL}`;
                const steamId = await fetch(ResolveVanityURL).then(res => res.json()).then(json => json['response']);

                if (!steamId['steamid']) return interaction.reply({ embeds: [errorEmbed.setDescription('Could not find a user with this profile url')], ephemeral: true });

                interaction.reply({ embeds: [succesEmbed.setDescription(`SteamID related to this profile ${steamId['steamid']}`)], ephemeral: true });
            }
            catch (err) {
                interaction.reply({ embeds: [errorEmbed.setDescription('could not fetch this steam user')], ephemeral: true });
            }
        }
        else {
            interaction.reply({ embeds: [errorEmbed.setDescription('Must be a profile url, examples\n(https://steamcommunity.com/id/..)\n(https://steamcommunity.com/profiles/..)')], ephemeral: true });
        }
    },
};
