const { CommandInteraction, GuildMember, MessageEmbed, Client, Message, MessageActionRow, MessageButton, InteractionCollector, Collection, MessageComponentInteraction } = require('discord.js')
const wait = require('util').promisify(setTimeout);

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
    name: "clan",
    category: "Configuration",
    description: "Change Prefix",
    perms: [],
    guildOnly: true,
    run:
        /**
         * 
         * @param {CommandInteraction} interaction 
         * @returns 
         */
        async (interaction) => {
            interaction.deferReply({ ephemeral: false }).then(async () => {
                await checkUser(interaction.member)

                if (interaction.options.getSubcommand() == 'display') {

                    if (interaction.options.getString('id'))
                        getData(interaction, interaction.member, interaction.options.getString('id'))
                    else {
                        if (!await checkMember(interaction.member))
                            return interaction.editReply({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor('25ad09')
                                        .setTitle('Clan')
                                        .setDescription('You currently don\'t have clan.\n\nUse `/clan join <clanID>` or wait for Clan Leader, Co-Leader to invite you')
                                ]
                            })
                        getData(interaction, interaction.member, false)
                    }
                }
                if (interaction.options.getSubcommand() == 'create') {
                    if (await checkMember(interaction.member))
                        return interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('25ad09')
                                    .setTitle('Clan')
                                    .setDescription('You already have clan.')
                            ]
                        })

                    registerClan(interaction, interaction.member, interaction.options.getString('name'), interaction.options.getString('type'))

                }
                if (interaction.options.getSubcommandGroup(false) == 'configure') {

                }
                if (interaction.options.getSubcommand() == 'delete') {

                }
                if (interaction.options.getSubcommand() == 'join') {
                    if (await checkMember(interaction.member))
                        return interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('25ad09')
                                    .setTitle('Clan')
                                    .setDescription('You already have clan.')
                            ]
                        })

                    joinClan(interaction, interaction.member, interaction.options.getString('id'), null)

                }
                if (interaction.options.getSubcommand() == 'leave') {
                    if (!await checkMember(interaction.member))
                        return interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('25ad09')
                                    .setTitle('Clan')
                                    .setDescription('You don\'t have a clan.')
                            ]
                        })
                    if (await checkLeader(interaction.member))
                        return interaction.editReply({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('25ad09')
                                    .setTitle('Clan')
                                    .setDescription('You are the current Leader. You need to pass the Leadership before you can leave')
                            ]
                        })

                    await sql.connect(sqlConfig)
                    await sql.query`DELETE FROM ClanMember WHERE userID = ${interaction.member.id} AND guildID = ${interaction.guildId}`
                    await sql.query`UPDATE UserProfile SET clanID = NULL WHERE userID = ${interaction.member.id} AND guildID = ${interaction.guildId}`

                    return interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                                .setColor('BLURPLE')
                                .setTitle('Clan')
                                .setDescription('You left the clan.')
                        ]
                    })
                }
            })
        }
}

/**
 * 
 * @param {GuildMember} member
 * @returns {Boolean} 
 */
async function checkLeader(member) {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * FROM ClanMember WHERE userID = ${member.id} AND guildID = ${member.guild.id}`

    if (result.recordset[0]?.role == 'LEADER')
        return true
    else
        return false
}


/**
 * 
 * @param {GuildMember} member 
 */
async function checkUser(member) {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * FROM UserProfile WHERE userID = ${member.id} AND guildID =${member.guild.id}`

    if (!result.recordset[0]) {
        await sql.query`INSERT INTO UserProfile(guildID, userID, userXP) VALUES(${member.guild.id}, ${member.id}, ${0})`
    }
}

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {String} clan 
 * @param {sql.IResult} result
 */
async function joinClan(interaction, member, clan, result) {
    await sql.connect(sqlConfig)
    result = await sql.query`SELECT * FROM GuildClan WHERE clanName = ${clan} AND guildID = ${interaction.guildId}`

    if (result.recordset[0]) {

        sql.query`INSERT INTO ClanMember(
            guildID,
            clanID,
            userID,
            role,
            contribution
            ) 
            VALUES(
            ${member.guild.id},
            ${result.recordset[0].clanID},
            ${member.id},
            ${'MEMBER'},
            ${0}
            )`
        sql.query`UPDATE UserProfile
            SET clanID = ${result.recordset[0].clanID} 
            WHERE userID = ${member.id} AND guildID = ${member.guild.id}`

        return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor('BLURPLE')
                    .setTitle('Clan Registered.')
                    .setDescription(`You have successfully joined ${result.recordset[0].clanName}.`)
            ]
        })
    } else {

        await sql.connect(sqlConfig)
        result = await sql.query`SELECT * FROM GuildClan WHERE clanID = ${clan} AND guildID = ${interaction.guildId}`
        if (!result.recordset[0])
            return interaction.editReply({
                embeds: [
                    new MessageEmbed()
                        .setColor('25ad09')
                        .setTitle('Clan')
                        .setDescription('I can\'t identify your clan you looking for.')
                ]
            })

        sql.query`INSERT INTO ClanMember(
            guildID,
            clanID,
            userID,
            role,
            contribution
            ) 
            VALUES(
            ${member.guild.id},
            ${result.recordset[0].clanID},
            ${member.id}, ${'MEMBER'},
            ${0}
            )`
        sql.query`UPDATE UserProfile
            SET clanID = ${result.recordset[0].clanID} 
            WHERE userID = ${member.id} AND guildID = ${member.guild.id}`

        return interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setColor('BLURPLE')
                    .setTitle('Clan Registered.')
                    .setDescription(`You have successfully joined ${result.recordset[0].clanName}.`)
            ]
        })
    }
}

/**
 * 
 * @param {GuildMember} member 
 * @returns  
 */
async function checkMember(member) {

    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * FROM UserProfile WHERE userID = ${member.id} AND guildID =${member.guild.id}`

    if (result.recordset[0]?.clanID) {
        return true
    } else {
        return false
    }
}

/**
 * 
 * @param {CommandInteraction} interaction
 * @param {GuildMember} member 
 * @param {String} clanName 
 */
async function registerClan(interaction, member, clanName, clanType) {

    sql.connect(sqlConfig)
    sql.query`INSERT INTO 
    GuildClan(
        guildID,
        clanName,
        clanLeaderID,
        clanLevel,
        clanDescription,
        clanType,
        clanWins
        ) 
    VALUES(
        ${member.guild.id},
        ${clanName},
        ${member.id},
        ${1},
        ${' '},
        ${clanType},
        ${0}
        )`



    sql.connect(sqlConfig).then(() => {
        return sql.query`SELECT * FROM GuildClan WHERE clanLeaderID = ${member.id}`
    }).then(async result => {

        sql.connect(sqlConfig)
        sql.query`INSERT INTO ClanMember(
            guildID,
            clanID,
            userID,
            role,
            contribution
            ) 
            VALUES(
            ${member.guild.id},
            ${result.recordset[0].clanID},
            ${member.id}, ${'LEADER'},
            ${0}
            )`
        sql.query`UPDATE UserProfile
            SET clanID = ${result.recordset[0].clanID} 
            WHERE userID = ${member.id} AND guildID = ${member.guild.id}`
        interaction.editReply({ content: 'Succcessfully created a clan!' })

    })
}

/**
 * 
 * @param {CommandInteraction} interaction 
 * @param {GuildMember} member 
 * @param {String} clan
 */
async function getData(interaction, member, clan) {
    if (clan) {
        sql.connect(sqlConfig).then(() => {
            return sql.query`SELECT 
        *
        FROM GuildClan
        WHERE GuildClan.clanID = ${clan} AND GuildClan.guildID = ${interaction.guild.id}`
        }).then(async result => {
            if (!result.recordset[0])
                return interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('25ad09')
                            .setTitle('Clan')
                            .setDescription('You currently don\'t have clan.\n\nUse `/clan join <clanID>` or wait for Clan Leader, Co-Leader to invite you')
                    ]
                })
            await sql.connect(sqlConfig)
            const result2 = await sql.query`SELECT contribution FROM ClanMember WHERE clanID = ${result.recordset[0].clanID} AND guildID = ${interaction.guildId}`

            displayClan(interaction, member, result.recordset[0], result2.recordset)

        }).catch(err => {
            console.log(err)
        })
    } else {
        sql.connect(sqlConfig).then(() => {
            return sql.query`SELECT 
        GuildClan.clanType,
        GuildClan.clanDescription,
        UserProfile.guildID,
        GuildClan.clanID,
        UserProfile.userID,
        UserProfile.userXP,
        GuildClan.clanLeaderID,
        GuildClan.clanName,
        GuildClan.clanLevel,
        GuildClan.clanWins
        FROM UserProfile 
        INNER JOIN GuildClan ON UserProfile.clanID = GuildClan.clanID 
        WHERE UserProfile.userID = ${member.id} AND UserProfile.guildID = ${interaction.guild.id}`
        }).then(async result => {
            if (!result.recordset[0])
                return interaction.editReply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('25ad09')
                            .setTitle('Clan')
                            .setDescription('You currently don\'t have clan.\n\nUse `/clan join <clanID>` or wait for Clan Leader, Co-Leader to invite you')
                    ]
                })
            await sql.connect(sqlConfig)
            const result2 = await sql.query`SELECT contribution FROM ClanMember WHERE clanID = ${result.recordset[0].clanID} AND guildID = ${interaction.guildId}`

            displayClan(interaction, member, result.recordset[0], result2.recordset)

        }).catch(err => {
            console.log(err)
        })
    }
}

/**
 * 
 * @param {CommandInteraction} interaction
 * @param {GuildMember} member 
 * @param {Array} data
 * @param {Array} contribution
 */
async function displayClan(interaction, member, data, contribution) {
    interaction.editReply({
        embeds: [
            new MessageEmbed()
                .setColor('#4dda3b')
                .setTitle(data.clanName)
                .setDescription(`(${data.clanID})
                \`\`\`${data.clanDescription}\`\`\`\n
                __Info:__\nChief: ${await getMember(interaction.client, interaction.guildId, data.clanLeaderID)}
                Members: ${await getAllMembers(interaction.client, data.clanID, interaction.guildId)} / ${100} | Type: ${data.clanType}
                Lv: ${await getLevel(0, await getTotalExp(contribution, 0), interaction.client, interaction.guildId, 0)}
                Wins: ${data.clanWins}
                
                __Clan Perks:__
                ${await getPerks()}`)
                .setThumbnail('https://img.icons8.com/color/452/discord-logo.png')
        ],
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('clan')
                        .setEmoji('877033223895543838')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('member')
                        .setEmoji('877032160920490025')
                        .setStyle('SECONDARY')
                )
        ]
    }).then(
        async msg => {
            updateEmbeds(msg, member, null, interaction, data, null, '', 1, new MessageEmbed(), [], contribution)
        })
}

/**
 * 
 * @param {Message} msg 
 * @param {GuildMember} member
 * @param {InteractionCollector} collector
 * @param {CommandInteraction} interaction
 * @param {Object} data 
 * @param {sql.IResult} result 
 * @param {String} description 
 * @param {Number} page
 * @param {MessageEmbed} embed
 * @param {Array} buttons
 * @param {Array} contribution
 */
async function updateEmbeds(msg, member, collector, interaction, data, result, description, page, embed, buttons, contribution) {

    const filter = (interaction) => ['clan', 'member'].includes(interaction.customId) && interaction.user.id === member.id;

    collector = new InteractionCollector(member.client, { filter, componentType: 'BUTTON', idle: 30000, time: 30000, channel: msg.channel, guild: msg.guild, message: msg })

    collector.on('collect',
        /**
         * 
         * @param {MessageComponentInteraction} interaction 
         */
        async interaction => {
            if (interaction.customId == 'clan') {
                interaction.update({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#4dda3b')
                            .setTitle(data.clanName)
                            .setDescription(`${data.clanName} (${data.clanID})
                            \`\`\`${data.clanDescription}\`\`\`\n
                            __Info:__\nChief: ${await getMember(interaction.client, interaction.guildId, data.clanLeaderID)}
                            Members: ${await getAllMembers(interaction.client, data.clanID, interaction.guildId)} / ${100} | Type: ${data.clanType}
                            Lv: ${await getLevel(0, await getTotalExp(contribution, 0), interaction.client, interaction.guildId, 0)}
                            Wins: ${data.clanWins}
            
                            __Clan Perks:__
                             ${await getPerks()}`)
                            .setThumbnail('https://img.icons8.com/color/452/discord-logo.png')
                    ],
                    components: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('clan')
                                    .setEmoji('877033223895543838')
                                    .setStyle('SECONDARY'),
                                new MessageButton()
                                    .setCustomId('member')
                                    .setEmoji('877032160920490025')
                                    .setStyle('SECONDARY')
                            )
                    ]
                })

            }
            if (interaction.customId == 'member') {
                buttons = [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('clan')
                                .setEmoji('877033223895543838')
                                .setStyle('SECONDARY'),
                            new MessageButton()
                                .setCustomId('member')
                                .setEmoji('877032160920490025')
                                .setStyle('SECONDARY'),
                            new MessageButton()
                                .setCustomId('prev')
                                .setEmoji('⬅')
                                .setStyle('SECONDARY')
                                .setDisabled(false),
                            new MessageButton()
                                .setCustomId('next')
                                .setEmoji('➡')
                                .setStyle('SECONDARY')
                                .setDisabled(false)
                        )
                ]

                await sql.connect(sqlConfig)
                result = await sql.query`SELECT * FROM ClanMember WHERE clanID = ${data.clanID}`

                result.recordset.sort(function (a, b) { return b.contribution - a.contribution })
                result.recordset.forEach(async (value, index) => {
                    if ((index >= ((10 * page) - 10)) && (index <= (10 * page - 1)))
                        description += `(*${value.role}*) | ${interaction.client.users.cache.get(value.userID)} [${addCommas(value.contribution)} XP]\n`
                })

                if ((0 < (10 * page) - 10)) {
                    buttons[0].components[2].setDisabled(false)
                } else {
                    buttons[0].components[2].setDisabled(true)
                }
                if ((result.recordset.length > 10 * page)) {
                    buttons[0].components[3].setDisabled(false)
                } else {
                    buttons[0].components[3].setDisabled(true)
                }

                interaction.update({
                    embeds: [
                        embed.setColor('AQUA')
                            .setTitle(`${data.clanName}'s Members`)
                            .setDescription(description)
                            .setTimestamp()
                            .setThumbnail('https://img.icons8.com/color/452/discord-logo.png')
                    ],
                    components: buttons
                })
            }
            if (interaction.customId == 'next') {
                page += 1
                buttons = [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('clan')
                                .setEmoji('877033223895543838')
                                .setStyle('SECONDARY'),
                            new MessageButton()
                                .setCustomId('member')
                                .setEmoji('877032160920490025')
                                .setStyle('SECONDARY'),
                            new MessageButton()
                                .setCustomId('prev')
                                .setEmoji('⬅')
                                .setStyle('SECONDARY')
                                .setDisabled(false),
                            new MessageButton()
                                .setCustomId('next')
                                .setEmoji('➡')
                                .setStyle('SECONDARY')
                                .setDisabled(false)
                        )
                ]
                await sql.connect(sqlConfig)
                result = await sql.query`SELECT * FROM ClanMember WHERE clanID = ${data.clanID}`

                result.recordset.sort(function (a, b) { return b.contribution - a.contribution })
                result.recordset.forEach(async (value, index) => {
                    if ((index >= ((10 * page) - 10)) && (index <= (10 * page - 1)))
                        description += `(*${value.role}*) | ${interaction.client.users.cache.get(value.userID)} [${addCommas(value.contribution)} XP]\n`
                })

                if ((0 < (10 * page) - 10)) {
                    buttons[0].components[2].setDisabled(false)
                } else {
                    buttons[0].components[2].setDisabled(true)
                }
                if ((result.recordset.length > 10 * page)) {
                    buttons[0].components[3].setDisabled(false)
                } else {
                    buttons[0].components[3].setDisabled(true)
                }


                interaction.update({
                    embeds: [
                        embed.setColor('AQUA')
                            .setTitle(`${data.clanName}'s Members`)
                            .setDescription(description)
                            .setTimestamp()
                            .setThumbnail('https://img.icons8.com/color/452/discord-logo.png')
                    ],
                    components: buttons
                })
            }
            if (interaction.customId == 'prev') {
                page -= 1
                buttons = [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('clan')
                                .setEmoji('877033223895543838')
                                .setStyle('SECONDARY'),
                            new MessageButton()
                                .setCustomId('member')
                                .setEmoji('877032160920490025')
                                .setStyle('SECONDARY'),
                            new MessageButton()
                                .setCustomId('prev')
                                .setEmoji('⬅')
                                .setStyle('SECONDARY')
                                .setDisabled(false),
                            new MessageButton()
                                .setCustomId('next')
                                .setEmoji('➡')
                                .setStyle('SECONDARY')
                                .setDisabled(false)
                        )
                ]
                await sql.connect(sqlConfig)
                result = await sql.query`SELECT * FROM ClanMember WHERE clanID = ${data.clanID}`

                result.recordset.sort(function (a, b) { return b.contribution - a.contribution })
                result.recordset.forEach(async (value, index) => {
                    if ((index >= ((10 * page) - 10)) && (index <= (10 * page - 1)))
                        description += `(*${value.role}*) | ${interaction.client.users.cache.get(value.userID)} [${addCommas(value.contribution)} XP]\n`
                })

                if ((0 < (10 * page) - 10)) {
                    buttons[0].components[2].setDisabled(false)
                } else {
                    buttons[0].components[2].setDisabled(true)
                }
                if ((result.recordset.length > 10 * page)) {
                    buttons[0].components[3].setDisabled(false)
                } else {
                    buttons[0].components[3].setDisabled(true)
                }


                interaction.update({
                    embeds: [
                        embed.setColor('AQUA')
                            .setTitle(`${data.clanName}'s Members`)
                            .setDescription(description)
                            .setTimestamp()
                            .setThumbnail('https://img.icons8.com/color/452/discord-logo.png')
                    ],
                    components: buttons
                })
            }
        })

    collector.on('end',
        /**
         * 
         * @param {Collection} collected 
         * @param {String} reason 
         */
        async (collected, reason) => {
            interaction.editReply({
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('clan')
                                .setEmoji('877033223895543838')
                                .setStyle('SECONDARY')
                                .setDisabled(true),
                            new MessageButton()
                                .setCustomId('member')
                                .setEmoji('877032160920490025')
                                .setStyle('SECONDARY')
                                .setDisabled(true)
                        )
                ]
            })
        })
}

/**
 * 
 * @param {Client} client 
 * @param {String}}
 * @param {String} userID 
 * @returns {GuildMember}
 */
async function getMember(client, guildID, userID) {
    await client.guilds.cache.get(guildID).members.fetch(userID)
    return client.guilds.cache.get(guildID).members.cache.get(userID)
}

/**
 * 
 * @param {Client} client 
 * @param {String} clanID 
 * @returns {Number}
 */
async function getAllMembers(client, clanID,guildID) {
    await sql.connect(sqlConfig)
    const result = await sql.query`SELECT * FROM ClanMember WHERE clanID = ${clanID} AND guildID = ${guildID}`

    return result.recordset.length
}

/**
 * 
 * @param {Array} data 
 * @return {Number} 
 */
async function getTotalExp(data, total) {
    data.forEach(async value => {
        total += value.contribution
    })

    return total
}

/**
 * 
 * @param {Number} level 
 * @param {Number} totalExp 
 * @param {Client} client 
 * @param {String} guildID 
 * @param {Number} goalExp 
 * @returns 
 */
async function getLevel(level, totalExp, client, guildID, goalExp) {
    if (totalExp < 0) {
        //add guild settings base, modifier

        return `${level} ( ${addCommas(totalExp + goalExp)} / ${addCommas(goalExp)} )`
    }
    else {
        if (client.guildSettings.get(guildID).equation == 1) {

            goalExp = await client.equation1(level, client.guildSettings.get(guildID).base, client.guildSettings.get(guildID).modifier)
            totalExp = totalExp - goalExp
            return getLevel(level + 1, totalExp, client, guildID, goalExp)

        } else if (client.guildSettings.get(guildID).equation == 2) {

            goalExp = await client.equation2(level, client.guildSettings.get(guildID).base, client.guildSettings.get(guildID).modifier)
            totalExp = totalExp - goalExp
            return getLevel(level + 1, totalExp, client, guildID, goalExp)

        } else if (client.guildSettings.get(guildID).equation == 3) {

            goalExp = await client.equation3(level, client.guildSettings.get(guildID).base, client.guildSettings.get(guildID).modifier)
            totalExp = totalExp - goalExp
            return getLevel(level + 1, totalExp, client, guildID, goalExp)

        } else if (client.guildSettings.get(guildID).equation == 4) {

            goalExp = await client.equation4(level, client.guildSettings.get(guildID).base, client.guildSettings.get(guildID).modifier)
            totalExp = totalExp - goalExp
            return getLevel(level + 1, totalExp, client, guildID, goalExp)

        } else {

            goalExp = await client.equation5(level, client.guildSettings.get(guildID).base, client.guildSettings.get(guildID).modifier)
            totalExp = totalExp - goalExp
            return getLevel(level + 1, totalExp, client, guildID, goalExp)

        }
    }
}

async function getPerks() {
    return 'not available for a moment.'
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}