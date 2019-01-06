import Discord, { Message } from "discord.js";
import * as helpers from "../util/helpers";
import * as config from "./config";
import { DISCORD_BOT_TOKEN } from "../util/secrets";
import { DISCORD_BOT_TOKEN_DEV } from "../util/secrets";
import { BOTWRANGLER_ID } from "../util/secrets";
import * as assignments from "../data/assignments";
import * as subscribers from "../data/subscribers";
import { IAssignment } from "../models/Assignment";

const client = new Discord.Client();

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    // client.user.setActivity(`Serving ${client.guilds.size} servers`);
    client.user.setActivity("Try " + config.prefix + "help");
  });

client.on("message", async message => {
        const messageLower = message.content.toUpperCase();

        // Ignore other bots
        if (message.author.bot) return;


        if (messageLower.indexOf("rip") > -1) {
            message.channel.send("Your sacrifice will be remembered.");
        }

        if (messageLower.indexOf("dude!") > -1) {
            message.channel.send("Sweet!");
        }
        if (messageLower.indexOf("sweet!") > -1) {
            message.channel.send("Dude!");
        }
        if (messageLower.toLowerCase().indexOf("i didnt study") > -1) {
            message.channel.send("May god have mercy on your soul.");
        }
        if (messageLower.toLowerCase().indexOf("propane") > -1) {
            message.channel.send(
            `\`………………_„-,-~\'\'~\'\'\':: :\'\':::\'::: ::\'\'::::\'\'...
            ………._,-\'\'::::: :::::::::::::::: ::::::::...
            ………..,-\':::: ::::::::::::: :::::::::::::...
            ………,-\'::::: :::::::„:„„-~-~--\'~-\'~--~-~....
            ……..,\'::::::::::,~\'\':: ::: ::: ::: ::: ::: :\'-|
            ……..|::::::::,-\':: ::: :: : - -~\'\'\'\'¯¯\'\'-„:: ::
            ……..|::::::::|:: ::: ::: :_„„--~\'\'\'\'\'~-„:: :: \'|
            ……..\'|:::::::,\':: ::: ::_„„-:: ::: :: : ~--„_: |\'
            ………|::::::|:: :„--~~\'\'\'~~\'\'\'\'\'\'-„…_..„~\'\'\'\'\'\'\'\'\'\'¯|
            ………|:::::,\':_„„-|: : :_„---~:::|\'\'¯¯\'\'|: ~---„_: ||
            ……..,~-,_/\'\':: :|: :(_ o__): : |:: ::|:(_o__): \..|
            ……../,\'-,:: :: : \'\'-,_______,-\'\':: :: \'\'-„_____|
            ……..\: :|:: ::: ::: ::: :: :„:: :: :-,:: ::: :: :
            ………\',:\':: ::: ::: ::: ::,-\'__:: ::_\',:: :: ;: ,\'
            ……….\'-,-\':: : : : :___„-: : :\'\': : ¯\'\'~~\'\': \':
            ………….|: ,:: ::: :: : ::: ::: : :: ::: ::: : :|
            ………….\'|: \:: : :: :: : -,„_„„-~~--~--„_: :: |
            …………..|: \:: : :: ::: :: : :-------~:: :: : |
            …………..|: :\'\'-,:: ::: :: : ::: ::: ::: :: : |
            …………..\',: : :\'\'-, :: : :: ::: ::: ::: :: :
            ……………| :: ::: :: : :_ :: ::: ::: :: ,-\'
            ……………|:: ::: ::: :: \'\'\'~----------~\'\'
            …………._|:: ::: ::: ::: ::: ::: :: :|
            ……….„-\'\'. \'-,_:: ::: ::: ::: ::: :: : ,\'
            ……,-\'\'. . . . . \'\'\'~-„_:: ::: ::: ::: ::,-\'\'\'-„\``);
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
        \n${config.prefix}due - See all due assignments
        \n${config.prefix}subscribe - Subscribe to assignment reminders
        \n${config.prefix}unsubscribe - Unsubscribe from assignment reminders
        \n${config.prefix}options - Set subscription options
        \n${config.prefix}request (message) - Request a new feature from the botwrangler
        \n${config.prefix}more - See more commands`);
    }

    if (command === "more") {
        message.channel.send(`More fun commands:
        \n${config.prefix}joke - maek lol
        \n${config.prefix}tableflip - \`(╯°□°）╯︵ ┻━┻\`
        \n${config.prefix}unflip - \`┬─┬ ノ( ゜-゜ノ)\`
        \n${config.prefix}shrug - \`¯\\_(ツ)_/¯\`
        \n${config.prefix}concern - \`ಠ_ಠ\`
        \n${config.prefix}dealwithit - \`(•_•) ( •_•)>⌐■-■ (⌐■_■)\`
        \n${config.prefix}mmm - \`( ಠ ͜ʖ ಠ)\``);
    }

    if (command === "request") {
        sendDiscordMessage(BOTWRANGLER_ID, message.author + " has made the following request: \n"
        + message.content);
        message.channel.send("Thank you for your feedback. Your message has been forwarded to the botwrangler.");
    }

    if (command === "options") {
        const daysAdvanceArg = parseInt(args[0]);
        const daysBetweenArg = parseInt(args[1]);
        const hourOfDayArg = parseInt(args[2]);

        if (args.length != 3
            || typeof daysAdvanceArg != "number"
            || typeof daysBetweenArg != "number"
            || typeof hourOfDayArg != "number"
            || daysAdvanceArg < 0 || daysAdvanceArg > 120
            || daysBetweenArg < 1 || daysBetweenArg > 21
            || hourOfDayArg < 0 || hourOfDayArg > 23) {
            message.channel.send(`Enter in subscription options in the following format:
            \n${config.prefix}options X Y Z
            \nwhere X is the number of days in advance (0-120) of a due date you would like to be reminded (default 3),
            \nY is the number of days (1-21) you would like between reminders (default 1),
            \nand Z is the hour of the day (0 - 23) that you would like to receive reminders (default 12)`);
        } else {
            try {
                await subscribers.updateOptions(message.author.id, daysAdvanceArg, daysBetweenArg, hourOfDayArg);
                message.channel.send("Thank you " + message.author + ", your options have been updated");
            } catch {
                message.channel.send("Sorry " + message.author + ", there was a problem updating your options. The botwrangler has been notified.");
                sendDiscordMessage(BOTWRANGLER_ID, message.author + " encountered an error updating their subscription options.");
            }
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

    if (command === "id") {
        message.channel.send(message.author.id);
    }

    if (command === "subscribe") {
        message.author.send("Thank you " + message.author + " for subscribing. To see your options, say " + config.prefix + "options");
        message.author.send("If you would like to receive reminders by text message, simply say " +
         config.prefix + "phone followed by your 10-digit phone number, for example:\n" + config.prefix + "phone 2508021111");

        subscribers.createOrSubscribe(message.author.id.toString());
    }
    if (command === "unsubscribe") {
        subscribers.unsubscribe(message.author.id.toString());
        message.author.send("You have been unsubscribed.");
    }
});
export const init = function () {
    const token = process.env.NODE_ENV == "production" ? DISCORD_BOT_TOKEN : DISCORD_BOT_TOKEN_DEV;
    client.login(token);
};

export const sendDiscordMessage = async function (discordId: string, message: string): Promise<void> {
    try {
        const user = await client.fetchUser(discordId);
        user.send(message);
    } catch (err) {
        console.log("error sending message to id " + discordId + ": " + err);
    }

};
