import Discord, { Message } from "discord.js";
import * as helpers from "./util/helpers";
import * as config from "./config/bot";
import { DISCORD_BOT_TOKEN } from "./util/secrets";
import * as assignments from "./data/assignments";
import * as subscribers from "./data/subscribers";
import { IAssignment } from "./models/Assignment";

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
        const messageUpper = message.content.toUpperCase();

        // Ignore other bots
        if (message.author.bot) return;


        if (messageUpper.indexOf("RIP") > -1) {
            message.channel.send("Your sacrifice will be remembered.");
        }

        if (messageUpper.indexOf("DUDE!") > -1) {
            message.channel.send("Sweet!");
        }
        if (messageUpper.indexOf("SWEET!") > -1) {
            message.channel.send("Dude!");
        }
        if (messageUpper.indexOf("I DIDNT STUDY") > -1) {
            message.channel.send("May god have mercy on your soul.");
        }
        if (messageUpper.toUpperCase().indexOf("PROPANE") > -1) {
            message.channel.send(`\`………………_„-,-~\'\'~\'\'\':::\'\':::\':::::\'\'::::\'\'...
            ………._,-\'\':::::::::::::::::::::::::::::...
            ………..,-\'::::::::::::::::::::::::::::::...
            ………,-\'::::::::::::„:„„-~-~--\'~-\'~--~-~...
            ……..,\'::::::::::,~\'\': : : : : : : : : : : : : : : : : : \'-|
            ……..|::::::::,-\': : : : : : : : - -~\'\'\'\'¯¯\'\'-„: : : : :\
            ……..|::::::::|: : : : : : : : : _„„--~\'\'\'\'\'~-„: : : : \'|
            ……..\'|:::::::,\': : : : : : :_„„-: : : : : : : : ~--„_: |\'
            ………|::::::|: : : „--~~\'\'\'~~\'\'\'\'\'\'\'\'-„…_..„~\'\'\'\'\'\'\'\'\'\'\'\'¯|
            ………|:::::,\':_„„-|: : :_„---~: : :|\'\'¯¯\'\'\'\'|: ~---„_: ||
            ……..,~-,_/\'\': : : |: :(_ o__): : |: : : :|:(_o__): \..|
            ……../,\'-,: : : : : \'\'-,_______,-\'\': : : : \'\'-„_____|
            ……..\: :|: : : : : : : : : : : : : :„: : : : :-,: : : : : : : :\
            ………\',:\': : : : : : : : : : : : :,-\'__: : : :_\',: : : : ;: ,\'
            ……….\'-,-\': : : : : :___„-: : :\'\': : ¯\'\'~~\'\': \': : ~--|\'
            ………….|: ,: : : : : : : : : : : : : : : : : : : : : :: : :|
            ………….\'|: \: : : : : : : : -,„_„„-~~--~--„_: :: |
            …………..|: \: : : : : : : : : : : :-------~: : : : : |
            …………..|: :\'\'-,: : : : : : : : : : : : : : : : : : : : :|
            …………..\',: : :\'\'-, : : : : : : : : : : : : : : : : :: ,\'
            ……………| : : : : : : : : :_ : : : : : : : : : : ,-\'
            ……………|: : : : : : : : : : \'\'\'~----------~\'\'
            …………._|: : : : : : : : : : : : : : : : : : : :|
            ……….„-\'\'. \'-,_: : : : : : : : : : : : : : : : : ,\'
            ……,-\'\'. . . . . \'\'\'~-„_: : : : : : : : : : : : :,-\'\'\'-„\``);
        }

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
        \n${config.prefix}due - See all due items
        \n${config.prefix}subscribe - Subscribe to reminders
        \n${config.prefix}unsubscribe - Subscribe to reminders
        \n${config.prefix}options - Set subscription options
        \n${config.prefix}mmm - ( ಠ ͜ʖ ಠ)`);
    }

    if (command === "say") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use.
        // To get the "message" itself we join the `args` back into a string with spaces:
        const sayMessage = args.join(" ");
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        message.delete().catch(O_o => {
            console.log(O_o);
        });
        // And we get the bot to say the thing:
        message.channel.send(sayMessage);
    }

    if (command === "options") {
        if (args.length != 3) {
            message.channel.send(`Enter in subscription options in the following format:
            \n${config.prefix}options X Y Z
            \nwhere X is the number of days in advance of a due date you would like to be reminded (default 3),
            \nY is the number of days you would like between reminders (default 1),
            \nand Z is the hour of the day (0 - 23) that you would like to receive reminders`);
        } else {
            subscribers.updateOptions(message.author.id, parseInt(args[0]), parseInt(args[1]), parseInt(args[2]));
        }
    }

    if (command === "joke") {
        let joke = "No joke for you";
        try {
            joke = await helpers.getJoke();
            console.log(joke);
        } catch (error) {
            console.log(error);
        }
        message.channel.send(joke);
    }

    if (command === "tableflip") {
        message.channel.send("\`(╯°□°）╯︵ ┻━┻\`");
    }

    if (command === "unflip") {
        message.channel.send("\`┬─┬ ノ( ゜-゜ノ)\`");
    }
    if (command === "shrug") {
        message.channel.send("\`¯\\_(ツ)_/¯\`");
    }

    if (command === "concern") {
        message.channel.send("ಠ_ಠ");
    }

    if (command === "mmm") {
        message.channel.send("( ಠ ͜ʖ ಠ)");
    }

    if (command === "dealwithit") {
        message.channel.send("\`(•_•) ( •_•)>⌐■-■ (⌐■_■)\`");
    }

    if (command === "due") {
        const dueAssignments = await assignments.readAllDue();

        // Display each assignment to the channel
        dueAssignments.forEach((docWrapper) => {
            const doc = <IAssignment>docWrapper.toObject();
            message.channel.send("Course: " + doc.course
            + "\nName: " + doc.name
            + "\nDue date: " + doc.dueDate
            + "\nURL: " + doc.url
            + "\nNote: " + doc.note
            + "\n-------------------------\n");
        });
    }

    if (command === "subscribe") {
        message.author.send("Thank you " + message.author + " for subscribing. To see your options, say " + config.prefix + "options");
        message.author.send("If you would like to receive reminders by text message, simply say " +
         config.prefix + "phone followed by your 10-digit phone number, for example:\n" + config.prefix + "phone 2508021111");

        subscribers.create(message.author.id.toString());
    }
});
export const init = function () {
    client.login(DISCORD_BOT_TOKEN);
};

export const sendDiscordMessage = async function (discordId: string, message: string): Promise<void> {
    try {
        const user = await client.fetchUser(discordId);
        user.send(message);
    } catch (err) {
        console.log("error sending message to id " + discordId + ": " + err);
    }

};
