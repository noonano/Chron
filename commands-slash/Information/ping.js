const { Interaction } = require('discord.js')

module.exports = {
    name: "test",
    category: "Information",
    description: "",
    perms: false,
    showHelp: false,
    run:
        /**
         * 
         * @param {Interaction} interaction 
         */
        async (interaction) => {
            await interaction.reply({ content: `message recieved and replied`, ephemeral: false })
        }
}

