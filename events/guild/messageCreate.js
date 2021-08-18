const { Message, Collection } = require('discord.js')
require('dotenv').config()

// Cooldowns
const cooldowns = new Collection();

module.exports = {
    name: 'messageCreate',
    once: false,
    /**
     * 
     * @param {Message} message 
     * @returns 
     */
    async execute(message) {
        try {
            if (message.author.bot) return
            if (message.channel.partial) await message.channel.fetch();
            if (message.partial) await message.fetch();
            if (!message.client.application?.owner) await message.client.application?.fetch();

            if (message.member.roles.cache.some(role => role.name === 'Bot Tester')) {
                return message.client.giveXpChat(message.member)
            }

            // const { guildPrefix } = (message.client.guildSettings.get(message.guildId).guildPrefix == null) ? false : message.client.guildSettings.get(message.guildId)
            // if (!message.content.startsWith(process.env.PREFIX)) {
            //     if (!guildPrefix) return
            //     if (!message.content.startsWith(guildPrefix)) return
            // }

            // let args;
            // if (message.content.startsWith(guildPrefix))
            //     args = message.content.slice(guildPrefix.length).split(/ +/);
            // else
            //     args = message.content.slice(process.env.PREFIX.length).split(/ +/);

            // const commandName = args.shift().toLowerCase();


            // const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            // // If command exist
            // if (!command) return;

            // // Check if command can be executed in DM
            // if (!command.guildOnly) {
            //     return message.reply('I can\'t execute that command inside DMs!');
            // }

            // // Check if args are required
            // if (command.args && !args.length) {
            //     let reply = `You didn't provide any arguments, ${message.author}!`;

            //     if (command.usage) {
            //         reply += `\nThe proper usage would be: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
            //     }

            //     return message.channel.send(reply);
            // }

            // // Check if user is in cooldown
            // if (!cooldowns.has(command.name)) {
            //     cooldowns.set(command.name, new Collection());
            // }

            // const now = Date.now();
            // const timestamps = cooldowns.get(command.name);
            // const cooldownAmount = (command.cooldown || 3) * 1000;

            // if (timestamps.has(message.author.id)) {
            //     const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            //     if (now < expirationTime) {
            //         // If user is in cooldown
            //         //const timeLeft = (expirationTime - now) / 1000;
            //         return //message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            //     }
            // } else {
            //     timestamps.set(message.author.id, now);
            //     setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
            //     // Execute command
            //     try {
            //         command.execute(message, args);
            //     } catch (error) {
            //         console.error(error);
            //         message.reply('there was an error trying to execute that command!');
            //     }
            // }
        } catch (err) {
            console.error(err)
        }
    }
}