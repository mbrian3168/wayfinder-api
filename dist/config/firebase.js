"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebase = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const initializeFirebase = () => {
    if (firebase_admin_1.default.apps.length)
        return;
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 env var is not set.');
    }
    const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii');
    const serviceAccount = JSON.parse(serviceAccountJson);
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized.');
};
exports.initializeFirebase = initializeFirebase;
