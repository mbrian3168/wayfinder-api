"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const firebase_1 = require("./config/firebase");
dotenv_1.default.config();
(0, firebase_1.initializeFirebase)();
const tripRoutes_1 = __importDefault(require("./routes/tripRoutes"));
const partnerRoutes_1 = __importDefault(require("./routes/partnerRoutes"));
const audioRoutes_1 = __importDefault(require("./routes/audioRoutes"));
const sdkRoutes_1 = __importDefault(require("./routes/sdkRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/v1/trip', tripRoutes_1.default);
app.use('/v1/partner', partnerRoutes_1.default);
app.use('/v1/audio', audioRoutes_1.default);
app.use('/v1/sdk', sdkRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('Wayfinder API is healthy');
});
// Root welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Wayfinder API. The API is healthy.',
        documentation: 'https://docs.wayfinder.app' // A placeholder for future documentation
    });
});
app.listen(PORT, () => {
    console.log(`🧭 Wayfinder API server running on port ${PORT}`);
});
exports.default = app; // Required for Vercel
