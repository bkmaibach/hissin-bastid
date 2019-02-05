"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EMoveTypes;
(function (EMoveTypes) {
    EMoveTypes[EMoveTypes["wall"] = 0] = "wall";
    EMoveTypes[EMoveTypes["body"] = 1] = "body";
    EMoveTypes[EMoveTypes["contested"] = 2] = "contested";
    EMoveTypes[EMoveTypes["uncontested"] = 3] = "uncontested";
    EMoveTypes[EMoveTypes["unknown"] = 4] = "unknown";
})(EMoveTypes = exports.EMoveTypes || (exports.EMoveTypes = {}));
var EMoveDirections;
(function (EMoveDirections) {
    EMoveDirections["up"] = "up";
    EMoveDirections["down"] = "down";
    EMoveDirections["left"] = "left";
    EMoveDirections["right"] = "right";
})(EMoveDirections = exports.EMoveDirections || (exports.EMoveDirections = {}));
//# sourceMappingURL=types.js.map