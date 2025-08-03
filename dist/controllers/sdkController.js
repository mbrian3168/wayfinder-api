"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportEvent = exports.getSdkConfig = void 0;
const getSdkConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`SDK is initializing for user ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.uid}`);
    res.status(200).json({
        voice_pack: 'default_cruise_pack',
        enable_banter_engine: true,
        api_version: 'v1'
    });
});
exports.getSdkConfig = getSdkConfig;
const reportEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { eventName } = req.body;
    console.log(`SDK reported event '${eventName}' for user ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.uid}`);
    res.status(200).json({ message: 'Event report received.' });
});
exports.reportEvent = reportEvent;
