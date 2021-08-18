const { Guild } = require('discord.js')

module.exports = {
    name: 'guildCreate',
    once: false,
    /**
     * 
     * @param {Guild} guild 
     * @returns 
     */
    async execute(guild) {
        return guild.client.registerGuild(guild);
    }
}