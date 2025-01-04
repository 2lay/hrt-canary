const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getCanaryHistory } = require('../utils/canaryChecker');

const ITEMS_PER_PAGE = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('Shows the canary check history')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of history entries to show (max 25)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(25)),

    async execute(interaction) {
        const limit = interaction.options.getInteger('limit') || 10;

        try {
            const history = await getCanaryHistory(limit);
            if (history.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle('Canary Check History')
                    .setColor('#F5A9B8')
                    .setDescription('No history available yet.')
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // split history into pages
            const pages = [];
            for (let i = 0; i < history.length; i += ITEMS_PER_PAGE) {
                pages.push(history.slice(i, i + ITEMS_PER_PAGE));
            }

            let currentPage = 0;

            // create embed for current page
            function createEmbed(pageIndex) {
                const embed = new EmbedBuilder()
                    .setTitle('Canary Check History')
                    .setColor('#F5A9B8')
                    .setFooter({ text: `Page ${pageIndex + 1}/${pages.length}` })
                    .setTimestamp();

                const historyText = pages[pageIndex]
                    .map(entry => {
                        const timestamp = Math.floor(new Date(entry.timestamp).getTime() / 1000);
                        return `<t:${timestamp}:f> | ${entry.event_type} - ${entry.message}`;
                    })
                    .join('\n');

                embed.setDescription(historyText);
                return embed;
            }

            // create navigation buttons
            function createButtons(pageIndex) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('<-')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(pageIndex === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('->')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(pageIndex === pages.length - 1)
                    );
                return row;
            }

            // initial reply
            const initialEmbed = createEmbed(currentPage);
            const components = pages.length > 1 ? [createButtons(currentPage)] : [];
            const message = await interaction.reply({
                embeds: [initialEmbed],
                components,
                ephemeral: true,
                fetchReply: true
            });

            if (pages.length <= 1) return;

            // Create button collector
            const collector = message.createMessageComponentCollector({
                time: 60000 // 1 minute timeout
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return await i.reply({
                        content: 'These buttons are not for you!',
                        ephemeral: true
                    });
                }

                if (i.customId === 'prev') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }

                await i.update({
                    embeds: [createEmbed(currentPage)],
                    components: [createButtons(currentPage)]
                });
            });

            collector.on('end', async () => {
                // Remove buttons after timeout
                await message.edit({
                    components: []
                }).catch(() => { });
            });

        } catch (error) {
            console.error('Error fetching history:', error);
            await interaction.reply({
                content: 'Failed to fetch canary history.',
                ephemeral: true
            });
        }
    },
};
