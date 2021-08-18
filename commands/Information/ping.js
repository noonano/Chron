module.exports = {
    name: "ping",
    aliases: ["p"],
    description: "description",
    category: "category",
    guildOnly: true,
    memberpermissions: ["VIEW_CHANNEL"],
    adminPermOverride: true,
    cooldown: 2,
    args: false,
    usage: "<Sample>",
    execute(message, args) {
        message.reply("pong!")
    },
};