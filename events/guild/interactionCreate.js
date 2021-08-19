const { Interaction } = require('discord.js')

module.exports = {
    name: 'interactionCreate',
    once: false,
    /**
     * 
     * @param {Interaction} interaction 
     * @returns 
     */
    async execute(interaction) {
        if (interaction.isCommand()) {
            if (!interaction.client.commands_slash.has(interaction.commandName)) return;

            if (!interaction.member.roles.cache.some(role => role.name === 'Bot Tester'))
                return interaction.reply({ content: 'You need **Bot Tester** Role to use this Bot' })

            const command = interaction.client.commands_slash.get(interaction.commandName)

            if (interaction.channel.type === 'GUILD_TEXT' && command.guildOnly) {

                if (!interaction.member.permissions.has(command.perms)) {
                    let neededPerms
                    command.perms.forEach(value => {
                        neededPerms += `\`${value}\` `
                    })
                    return interaction.reply({ content: `You don't have permission to run this command\nYou need ${neededPerms}`, ephemeral: true })
                }

                try {
                    await command.run(interaction)
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }

            } else {
                return interaction.reply({ content: `I can\'t execute that command inside DMs!`, ephemeral: true })
            }
        }
    }
}