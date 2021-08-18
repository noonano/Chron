const { Guild, GuildMember, Collection } = require('discord.js')
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
module.exports = async (client) => {

    //variable equation that uses the base and modifier
    client.equation1 =
        /**
         * 
         * @param {Number} level 
         * @param {Number} base 
         * @param {Number} modifier 
         * @returns {Number}
         */
        async (level, base, modifier) => {
            //=base + (ROUND(base * (modifier / 100) * (level - 1)) * (level - 1))
            return base + (Math.round(base * (modifier / 100) * (level - 1)) * (level - 1))
        }

    //bell curve equation
    client.equation2 =
        /**
         * 
         * @param {Number} level 
         * @param {Number} base 
         * @param {Number} modifier 
         * @returns {Number}
         */
        async (level, base, modifier) => {
            //=((5 * POW(level, 2)) + (50 * level) + 100) + level - 1
            return ((5 * Math.pow(level, 2)) + (50 * level) + 100) + (level - 1)
        }

    //linear equation
    client.equation3 =
        /**
         * 
         * @param {Number} level 
         * @param {Number} base 
         * @param {Number} modifier 
         * @returns {Number}
         */
        async (level, base, modifier) => {
            //= base+ (level * modifier)
            return base + (level * modifier)
        }

    //quadratic equation
    client.equation4 =
        /**
         * 
         * @param {Number} level 
         * @param {Number} base 
         * @param {Number} modifier 
         * @returns {Number}
         */
        async (level, base, modifier) => {
            //=(modifier * POW(level,2)) + base   
            return (modifier * Math.pow(level, 2)) + base
        }

    //another quadratic equation
    client.equation5 =
        /**
         * 
         * @param {Number} level 
         * @param {Number} base 
         * @param {Number} modifier 
         * @returns {Number}
         */
        async (level, base, modifier) => {
            //(modifier * POW(level,2)) + base * level 
            return (modifier * Math.pow(level, 2)) + base * level
        }

    client.registerGuild =
        /**
         * 
         * @param {Guild} guild 
         * @returns 
         */
        async (guild) => {

            sql.connect(sqlConfig).then(() => {
                return sql.query`SELECT * FROM Guild WHERE guildID = ${guild.id}`
            }).then(async result => {
                if (!result.recordset[0]) {
                    await sql.connect(sqlConfig)
                    return await sql.query`INSERT INTO Guild(
                        guildID,
                        guildMessageXP,
                        guildVoiceXP,
                        guildMessageCooldown,
                        guildVoiceCooldown,
                        equation,
                        base,
                        modifier
                        ) 
                    VALUES(
                        ${guild.id},
                        ${3},
                        ${3},
                        ${5},
                        ${5},
                        ${1},
                        ${20},
                        ${100}
                        )`
                }

                await client.guildSettings
                    .set(
                        guild.id, {
                        guildPrefix: null,
                        guildMessageXp: 3,
                        guildVoiceXp: 3,
                        guildMessageCooldown: 5,
                        guildVoiceCooldown: 5,
                        equation: 1,
                        base: 20,
                        modifier: 100
                    })
            }).catch(err => {
                console.log(err)
            })

        }

    client.giveXpVoice =
        /**
         * 
         * @param {GuildMember} member 
         * @param {Number} Exp 
         */
        async (member, voiceTime) => {
            const { guildVoiceCooldown, guildVoiceXp } = member.client.guildSettings.get(member.guild.id)
            console.log(`${guildVoiceXp} xp\n${guildVoiceCooldown} cd`)
            const voiceCooldown = guildVoiceCooldown * 60000
            console.log(voiceCooldown)

            const ExpGained = Math.round(voiceTime / voiceCooldown) * guildVoiceXp
            console.log(ExpGained)

            sql.connect(sqlConfig).then(() => {
                return sql.query`SELECT * FROM UserProfile WHERE userID = ${member.id} AND guildID = ${member.guild.id}`
            }).then(async result => {
                if (result.recordset[0]) {
                    await sql.query`UPDATE UserProfile SET userXP = ${(result.recordset[0].userXP == null) ? 0 : result.recordset[0].userXP + ExpGained
                        } WHERE userID = ${member.id} AND guildID = ${member.guild.id} `
                } else {
                    await sql.query`INSERT INTO UserProfile(guildID, userID, userXP) VALUES(${member.guild.id}, ${member.id}, ${ExpGained})`
                }
            }).catch(err => {
                console.log(err)
            })
        }

    client.giveXpChat =
        /**
         * 
         * @param {GuildMember} member 
         * @returns 
         */
        async (member) => {
            const { guildMessageCooldown, guildMessageXp } = member.client.guildSettings.get(member.guild.id)
            if (!member.client.cooldownXP.has(member.id + member.guild.id)) {
                member.client.cooldownXP.set(member.id + member.guild.id, new Collection());
            }

            const now = Date.now();
            const timestamps = member.client.cooldownXP.get(member.id + member.guild.id);
            const cooldownAmount = (guildMessageCooldown) * 60000;

            if (timestamps.has(member.id + member.guild.id)) {
                const expirationTime = timestamps.get(member.id + member.guild.id) + cooldownAmount;

                if (now < expirationTime) {
                    //If user is in cooldown
                    const timeLeft = (expirationTime - now) / 1000;
                    return //console.log(`please wait ${timeLeft.toFixed(1)} more second(s) before obtaining exp.`);
                }
            } else {
                timestamps.set(member.id + member.guild.id, now);
                setTimeout(() => timestamps.delete(member.id + member.guild.id), cooldownAmount);
                // Execute command
                try {
                    sql.connect(sqlConfig).then(() => {
                        return sql.query`SELECT * FROM UserProfile WHERE userID = ${member.id} AND guildID = ${member.guild.id}`
                    }).then(async result => {
                        if (result.recordset[0]) {
                            await sql.query`UPDATE UserProfile SET userXP = ${(result.recordset[0].userXP == null) ? 0 : result.recordset[0].userXP + guildMessageXp
                                } WHERE userID = ${member.id} AND guildID = ${member.guild.id} `
                        } else {
                            await sql.query`INSERT INTO UserProfile(guildID, userID, userXP) VALUES(${member.guild.id}, ${member.id}, ${guildMessageXp})`
                        }
                    }).catch(err => {
                        console.log(err)
                    })
                } catch (error) {
                    console.error(error);
                    console.log('there was an error trying to execute that command!');
                }
            }
        }
}