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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeFirebaseToken = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const decodeFirebaseToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
    if (!idToken) {
        return res.status(401).send({ error: 'Unauthorized: No token provided.' });
    }
    try {
        const decodedToken = yield firebase_admin_1.default.auth().verifyIdToken(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        next();
    }
    catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(401).send({ error: 'Unauthorized: Invalid token.' });
    }
});
exports.decodeFirebaseToken = decodeFirebaseToken;
