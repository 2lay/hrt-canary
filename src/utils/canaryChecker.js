const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
const { addHistoryEvent, getHistory } = require('./database');
const { verifySignature } = require('./pgpVerifier');

const CANARY_URL = process.env.CANARY_URL;
let lastCanaryContent = '';
let lastCheckTime = new Date();

async function checkCanary(client) {
    try {
        const response = await fetch(CANARY_URL);
        const currentCanary = await response.text();
        lastCheckTime = new Date();
        
        const embed = new EmbedBuilder()
            .setTitle('AstroVials Canary Check')
            .setTimestamp();

        // Verify PGP signature
        const verification = await verifySignature(currentCanary);
        
        if (!verification.isValid) {
            embed.setColor('#f07878')
                .setDescription('🚨 INVALID PGP SIGNATURE!\n \`' + verification.error + '\`');
            await addHistoryEvent('ERROR', 'Invalid PGP signature');
            const channel = await client.channels.fetch(process.env.CHANNEL_ID);
            await channel.send({ content: '@everyone', embeds: [embed] });
            return embed;
        } else if (lastCanaryContent && lastCanaryContent !== currentCanary) {
            embed.setColor('#ede07e')
                .setDescription('⚠️ Canary content has changed.\nSignature verified with key: \`' + verification.keyID + '\`');
            await addHistoryEvent('CHANGE', 'Canary content has changed - Signature verified');
            const channel = await client.channels.fetch(process.env.CHANNEL_ID);
            await channel.send({ content: '@everyone', embeds: [embed] });
            return embed;
        } else if (!lastCanaryContent) {
            embed.setColor('#7eed87')
                .setDescription(`✅ Initial canary check completed.\nSignature verified with key: \`${verification.keyID}\``);
            await addHistoryEvent('INIT', 'Initial canary check completed - Signature verified');
        } else {
            embed.setColor('#7eed87')
                .setDescription(`✅ Canary status normal.\nSignature verified with key: \`${verification.keyID}\``);
            await addHistoryEvent('CHECK', 'Canary status normal - Signature verified');
        }

        if (verification.date) {
            const lastUpdate = new Date(verification.date);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            if (lastUpdate < threeMonthsAgo) {
                embed.setColor('#f07878')
                    .setDescription('🚨 WARNING: Canary is outdated!');
                await addHistoryEvent('WARNING', 'Canary is outdated');
                const channel = await client.channels.fetch(process.env.CHANNEL_ID);
                await channel.send({ content: '@everyone', embeds: [embed] });
                return embed;
            }

            embed.addFields({ 
                name: 'Last Update', 
                value: `<t:${Math.floor(lastUpdate.getTime() / 1000)}:D>` 
            });
        }

        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        await channel.send({ embeds: [embed] });

        lastCanaryContent = currentCanary;
        return embed;

    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('AstroVials Canary Check - Error')
            .setColor('#f07878')
            .setDescription(`🚨 Failed to fetch canary: \`${error.message}\``)
            .setTimestamp();

        await addHistoryEvent('ERROR', `Failed to fetch canary: \`${error.message}\``);
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        await channel.send({ content: '@everyone', embeds: [errorEmbed] });
        return errorEmbed;
    }
}

async function getCanaryHistory(limit = 10) {
    return await getHistory(limit);
}

module.exports = {
    checkCanary,
    getCanaryHistory,
    lastCheckTime,
    CANARY_URL
};
