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
exports.generateDynamicAudio = exports.getAudioStream = void 0;
const getAudioStream = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message_id } = req.params;
    console.log(`Fetching audio stream for message: ${message_id}`);
    res.status(200).json({ url: `https://fake-cdn.com/audio/${message_id}.mp3` });
});
exports.getAudioStream = getAudioStream;
const generateDynamicAudio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text, host_id } = req.body;
    console.log(`Generating audio for host ${host_id} with text: "${text}"`);
    res.status(201).json({ stream_url: 'https://fake-tts-service.com/stream/xyz123.mp3' });
});
exports.generateDynamicAudio = generateDynamicAudio;
