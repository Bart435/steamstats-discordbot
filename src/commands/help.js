const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows help embed.")
        .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Help Command')
            .addFields({ name: '/steamstats', value: 'Fetching user data from the steam api. In order to convert a steam profile url to a steam64 id, Run the /profile-url command.' })
            .addFields({ name: '/profile-url', value: "Fetching steam64 id making use of a profile url. Takes both standard and vanity url's.\nGo to [steam](https://store.steampowered.com/) to get your profile url." })
        interaction.reply({ embeds: [embed] });
    },
};
