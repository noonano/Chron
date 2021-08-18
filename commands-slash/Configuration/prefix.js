const { Interaction } = require('discord.js')
const sql = require('mssql')
const sqlConfig = {
    user: 'sa',
    password: 'defaultpassword123',
    database: 'Chron',
    server: 'localhost',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}
module.exports = {
    name: "prefix",
    category: "Configuration",
    description: "Change Prefix",
    perms: ['ADMINISTRATOR', 'MANAGE_GUILD'],
    guildOnly: true,
    run:
        /**
         * 
         * @param {Interaction} interaction 
         */
        async (interaction) => {
            const { value } = await interaction.options._hoistedOptions[0]

            await sql.connect(sqlConfig)
            await sql.query`UPDATE Guild SET guildPrefix = ${value} WHERE guildID = ${interaction.guildId}`
            interaction.client.guildSettings.get(interaction.guildId).guildPrefix = value
            interaction.reply(`Prefix Set! \`${value}\``)
        }
}
