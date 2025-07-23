"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDynamicIcons = void 0;
const withAlternateIcons_android_1 = __importDefault(require("./withAlternateIcons.android"));
const withAlternateIcons_ios_1 = __importDefault(require("./withAlternateIcons.ios"));
const withDynamicIcons = (config, alternateIcons) => {
    let pluginConfig = (0, withAlternateIcons_ios_1.default)(config, alternateIcons);
    pluginConfig = (0, withAlternateIcons_android_1.default)(config, alternateIcons);
    return pluginConfig;
};
exports.withDynamicIcons = withDynamicIcons;
exports.default = exports.withDynamicIcons;
