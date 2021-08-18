const { Client } = require('discord.js')


module.exports = {
    name: 'warn',
    once: false,
    /**
     * 
     * @param {Client} client 
     */
    async execute(client) {
        console.warn()

    }
}