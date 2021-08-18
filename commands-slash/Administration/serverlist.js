const { Interaction, Client, GuildMember } = require('discord.js')

module.exports = {
    name: "tete",
    category: "Administration",
    aliases: ["t"],
    cooldown: 2,
    usage: "Collect your daily shims.",
    description: "",
    perms: false,
    showHelp: false,
    run:
        /**
         * 
         * @param {Client} client 
         * @param {Interaction} interaction 
         * @param {GuildMember} user 
         */
        async (client, interaction, user) => {
            console.log(interaction)
        }
}