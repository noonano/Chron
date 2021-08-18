const { Client } = require('discord.js')

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
    name: 'ready',
    once: true,
    /**
     * 
     * @param {Client} client 
     */
    async execute(client) {
        try {
            sql.connect(sqlConfig).then(async () => {
                return sql.query`SELECT * FROM Guild`
            }).then(async result => {
                if (result.recordset.length !== 0) {
                    result.recordset.forEach(async function (value, index) {
                        await client.guildSettings
                            .set(
                                value.guildID, {
                                guildPrefix: value.guildPrefix,
                                guildMessageXp: value.guildMessageXP,
                                guildVoiceXp: value.guildVoiceXP,
                                guildMessageCooldown: parseInt(value.guildMessageCooldown),
                                guildVoiceCooldown: parseInt(value.guildVoiceCooldown),
                                equation: value.equation,
                                base: value.base,
                                modifier: value.modifier
                            })
                    })
                }
            }).catch(err => {
                console.log(err)
            })

            client.guilds.cache.forEach(async value => {
                await value.channels.fetch()

                value.channels.cache.forEach(async channel => {
                    if (channel.type !== 'GUILD_VOICE') return

                    const voiceUsers = channel.members.filter(member => !member.user.bot)
                    if (voiceUsers.size >= 2) {
                        voiceUsers.forEach(member => {
                            if (!member.roles.cache.some(role => role.name === 'Bot Tester')) return
                            if (!client.voiceExp.has(member.id)) {
                                client.voiceExp.set(member.id, Date.now())
                            }
                        })
                    }
                })
            })

            const stringlength = 69;
            console.log("\n")
            console.log(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.bold.brightGreen)
            console.log(`     ┃ `.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightGreen)
            console.log(`     ┃ `.bold.brightGreen + `Discord Bot is online!`.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length - `Discord Bot is online!`.length) + "┃".bold.brightGreen)
            console.log(`     ┃ `.bold.brightGreen + ` /--/ ${client.user.tag} /--/ `.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length - ` /--/ ${client.user.tag} /--/ `.length) + "┃".bold.brightGreen)
            console.log(`     ┃ `.bold.brightGreen + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightGreen)
            console.log(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.bold.brightGreen)
        } catch { /* */ }

    }
}