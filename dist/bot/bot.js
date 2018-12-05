"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const helpers = __importStar(require("../util/helpers"));
const config = __importStar(require("./config"));
const secrets_1 = require("../util/secrets");
const assignments = __importStar(require("../data/assignments"));
const subscribers = __importStar(require("../data/subscribers"));
const client = new discord_js_1.default.Client();
client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    // client.user.setActivity(`Serving ${client.guilds.size} servers`);
    client.user.setActivity("Try ~help");
});
client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
    const messageLower = message.content.toUpperCase();
    // Ignore other bots
    if (message.author.bot)
        return;
    if (messageLower.indexOf("rip") > -1) {
        message.channel.send("Your sacrifice will be remembered.");
    }
    if (messageLower.indexOf("dude!") > -1) {
        message.channel.send("Sweet!");
    }
    if (messageLower.indexOf("sweet!") > -1) {
        message.channel.send("Dude!");
    }
    if (messageLower.indexOf("i didnt study") > -1) {
        message.channel.send("May god have mercy on your soul.");
    }
    if (messageLower.toUpperCase().indexOf("propane") > -1) {
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
    if (!message.content.startsWith(config.prefix))
        return;
    // slice off the prefix, trim whitespace from ends, and split into array by whitespace
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = yield message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
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
        }
        else {
            subscribers.updateOptions(message.author.id, parseInt(args[0]), parseInt(args[1]), parseInt(args[2]));
        }
    }
    if (command === "joke") {
        let joke = "No joke for you";
        try {
            joke = yield helpers.getJoke();
            console.log(joke);
        }
        catch (error) {
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
        const dueAssignments = yield assignments.readAllDue();
        // Display each assignment to the channel
        dueAssignments.forEach((docWrapper) => {
            const doc = docWrapper.toObject();
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
}));
exports.init = function () {
    client.login(secrets_1.DISCORD_BOT_TOKEN);
};
exports.sendDiscordMessage = function (discordId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield client.fetchUser(discordId);
            user.send(message);
        }
        catch (err) {
            console.log("error sending message to id " + discordId + ": " + err);
        }
    });
};
//# sourceMappingURL=bot.js.map