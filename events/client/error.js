const { Client } = require('discord.js')


module.exports = {
    name: 'error',
    once: false,
    /**
     * 
     * @param {Client} client 
     */
    async execute(client) {
            console.error()

    }
}