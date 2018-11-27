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
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
const helpers = __importStar(require("./helpers"));
const config = __importStar(require("./config/bot"));
const secrets_1 = require("./util/secrets");
const assignments = __importStar(require("./responders/assignments"));
const subscribers = __importStar(require("./responders/subscribers"));
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
        \n${config.prefix}options - Set subscription options`);
    }
    if (command === "joke") {
        const joke = yield helpers.getJoke();
        message.channel.send(joke);
    }
    if (command === "due") {
        const docs = yield assignments.readAll();
        const now = new Date().valueOf();
        // Throw out all assignment docs that are past due
        const dueAssignments = docs.filter(doc => doc.dueDate.valueOf() > now);
        // Sort assignments by due date
        dueAssignments.sort((a, b) => {
            const dueDateA = a.dueDate.valueOf();
            const dueDateB = b.dueDate.valueOf();
            if (dueDateA < dueDateB)
                return -1;
            if (dueDateA > dueDateB)
                return 1;
            return 0;
        });
        // Display each assignment to the channel
        dueAssignments.forEach((doc) => {
            message.channel.send("Course: " + doc.course + "\nName: " + doc.name + "\nDue date: " + doc.dueDate
                + "\nURL: " + doc.url + "\nNote: " + doc.note + "\n-------------------------\n");
        });
    }
    if (command === "subscribe") {
        message.author.send("Thank you " + message.author + " for subscribing. To see your options, say " + config.prefix + "options");
        message.author.send("If you would like to receive reminders by text message, simply say " +
            config.prefix + "phone followed by your 10-digit phone number, for example:\n" + config.prefix + "phone 2508021111");
        subscribers.create(message.author.id.toString());
        // const user = await client.fetchUser(message.author.id);
        // user.sendMessage("BLAH");
    }
}));
exports.init = function () {
    client.login(secrets_1.DISCORD_BOT_TOKEN);
};
//# sourceMappingURL=bot.js.map