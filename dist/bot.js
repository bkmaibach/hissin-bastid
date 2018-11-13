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
const helpers = __importStar(require("./helpers"));
const config = __importStar(require("./config/bot"));
const secrets_1 = require("./util/secrets");
const assignments = __importStar(require("./responders/assignments"));
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
        \n~read - reads all assignments`);
    }
    if (command === "joke") {
        const joke = yield helpers.getJoke();
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
        const docs = yield assignments.readAll();
        message.channel.send(docs);
    }
}));
exports.init = function () {
    client.login(secrets_1.DISCORD_BOT_TOKEN);
};
//# sourceMappingURL=bot.js.map