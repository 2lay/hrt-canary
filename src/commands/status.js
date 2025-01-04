const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lastCheckTime, CANARY_URL } = require('../utils/canaryChecker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Show current monitoring status'),
    async execute(interaction) {
        const timestamp = Math.floor(new Date(lastCheckTime).getTime() / 1000);
        const embed = new EmbedBuilder()
            .setTitle('Canary Monitor Status')
            .setDescription(`Last check: <t:${timestamp}:f>\nMonitoring: ${CANARY_URL}`)
            .setColor('#F5A9B8')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
};
