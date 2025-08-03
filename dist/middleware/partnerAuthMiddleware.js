"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPartnerApiKey = void 0;
const verifyPartnerApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.PARTNER_API_KEY) {
        return res.status(403).send({ error: 'Forbidden: Invalid or missing API Key.' });
    }
    next();
};
exports.verifyPartnerApiKey = verifyPartnerApiKey;
