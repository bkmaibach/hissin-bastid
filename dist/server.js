"use strict";
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
const errorhandler_1 = __importDefault(require("errorhandler"));
const bot = __importStar(require("./bot"));
const app_1 = __importDefault(require("./app"));
/**
 * Error Handler. Provides full stack - remove for production
 */
app_1.default.use(errorhandler_1.default());
/**
 * Start Express server.
 */
const server = app_1.default.listen(app_1.default.get("port"), () => {
    console.log("  App is running at http://localhost:%d in %s mode", app_1.default.get("port"), app_1.default.get("env"));
    console.log("  Press CTRL-C to stop\n");
});
bot.init();
exports.default = server;
//# sourceMappingURL=server.js.map