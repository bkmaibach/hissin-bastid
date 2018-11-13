import Discord, { Message } from "discord.js";
import * as helpers from "./helpers";
import * as config from "./config/bot";
import { DISCORD_BOT_TOKEN } from "./util/secrets";
import * as assignments from "./responders/assignments";
import { assign } from "nodemailer/lib/shared";

const client = new Discord.Client();

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    // client.user.setActivity(`Serving ${client.guilds.size} servers`);
    client.user.setActivity("Try ~help");
  });

client.on("message", async message => {

    // Ignore if not a prefix
    if (!message.content.startsWith(config.prefix)) return;

    // slice off the prefix, trim whitespace from ends, and split into array by whitespace
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await message.channel.send("Ping?");
        (m as Message).edit(`Pong! Latency is ${(m as Message).createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    if (command === "help") {
        message.channel.send(`Available commands:
        \n~read - reads all assignments`);
    }

    if (command === "joke") {
        const joke = await helpers.getJoke();
        message.channel.send(joke);
    }

    // if (command === "create") {
    //     if (args.length != 6) {
    //         message.channel.send("Incorrect format");
    //     } else {
    //         console.log(message.author.id);

    //         const name = args[0].replace("\"", "");
    //         const dueDate = new Date(args[1]);
    //         const percentOfGrade = parseInt(args[2]);
    //         const url = args[3];
    //         const type = args[4];
    //         const note = args[5].replace("\"", "");
    //         assignments.create(name, dueDate, percentOfGrade, url, type, note );
    //     }
    // }

    if (command === "all") {
        const docs = await assignments.readAll();
        message.channel.send(docs);
    }
});

export const init = function () {
    client.login(DISCORD_BOT_TOKEN);
};

