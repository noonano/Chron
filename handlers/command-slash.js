const { readdirSync } = require("fs");
const ascii = require("ascii-table");
let table = new ascii("Slash Commands");
table.setHeading("Slash Command", "Load status");
module.exports = (client) => {
    try {
        const stringlength2 = 69;
        console.log("\n")
        console.log(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.bold.yellow)
        console.log(`     ┃ `.bold.yellow + " ".repeat(-1 + stringlength2 - ` ┃ `.length) + "┃".bold.yellow)
        console.log(`     ┃ `.bold.yellow + `Loading Slash Commands...`.bold.yellow + " ".repeat(-1 + stringlength2 - ` ┃ `.length - `Loading Slash Commands...`.length) + "┃".bold.yellow)
        console.log(`     ┃ `.bold.yellow + " ".repeat(-1 + stringlength2 - ` ┃ `.length) + "┃".bold.yellow)
        console.log(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.bold.yellow)
    } catch { /* */ }

    try {
        readdirSync("./commands-slash/").forEach((dir) => {
            const commands = readdirSync(`./commands-slash/${dir}/`).filter((file) => file.endsWith(".js"));
            for (let file of commands) {
                let pull = require(`../commands-slash/${dir}/${file}`);
                if (pull.name) {
                    client.commands_slash.set(pull.name, pull);
                    table.addRow(file, 'Ready');
                } else {
                    table.addRow(file, `error->missing a help.name,or help.name is not a string.`);
                    continue;
                }
            }
        });
        console.log(table.toString().bold.brightYellow);
    } catch (e) {
        console.log(String(e.stack))
    }
}