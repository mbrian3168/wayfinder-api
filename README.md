# 🧭 Wayfinder API

A GPS-aware travel-tech platform that transforms car rides into narrated, immersive journeys using real-time location data to trigger audio storytelling, dynamic music, trivia, and branded Points of Interest (POIs).

## 🚀 Features

- **Firebase Authentication** - Secure user authentication with JWT tokens
- **Partner API** - Separate authentication system for business partners
- **Location-based Services** - PostGIS integration with Haversine fallback
- **Rate Limiting** - Comprehensive rate limiting per endpoint type
- **Input Validation** - Zod-based request validation with detailed error handling
- **Error Handling** - Structured error responses with request tracking
- **OpenAPI Documentation** - Auto-generated API documentation
- **TypeScript** - Full type safety throughout the application

## 📋 Prerequisites

- **Node.js** 20.x
- **PostgreSQL** with PostGIS extension
- **Firebase Project** with Admin SDK
- **Partner API Key** (32+ characters minimum)

## ⚡ Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://username:password@localhost:5432/wayfinder
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour-Key\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
PARTNER_API_KEY=your-super-secure-32-character-api-key-here-minimum
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 2. Installation

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start development server
npm run dev
```

### 3. Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Format code
npm run format
```

## 🔌 API Endpoints

### Public Endpoints

- `GET /` - HTML landing page
- `GET /v1` - API index (JSON)
- `GET /v1/health` - Health check with database connectivity
- `GET /v1/status` - Runtime information
- `GET /v1/docs` - Interactive API documentation

### Authentication Required (Firebase JWT)

- `POST /v1/trip/start` - Start a new trip
- `PATCH /v1/trip/:id/update` - Update trip progress
- `GET /v1/trip/:id/nearby-pois` - Get nearby points of interest
- `POST /v1/trip/:id/trigger-event` - Trigger trip events

### Partner API (API Key Required)

- `POST /v1/partner/:id/poi` - Create points of interest
- `POST /v1/partner/:id/schedule-message` - Schedule location-based messages

## 🔒 Security Features

### Rate Limiting
- **General API**: 100 requests/15 minutes per IP
- **Authentication**: 20 requests/15 minutes per IP  
- **Trip Creation**: 10 requests/5 minutes per IP
- **Partner API**: 500 requests/15 minutes per IP

### Request Validation
- Zod schema validation for all inputs
- Coordinate validation for geographic data
- UUID validation for entity references

### Error Handling
- Structured error responses with request IDs
- No sensitive data in error messages
- Comprehensive logging for debugging

## 🗄️ Database Schema

Key models:
- **User** - Firebase-authenticated users
- **Trip** - Active journeys with routes
- **POI** - Points of interest with geofencing
- **Partner** - Business partners managing content
- **HostProfile** - AI personalities for trip narration
- **Message** - Location-triggered content

## 🚦 Development

### Code Quality
```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Formatting
npm run format

# Testing
npm test
```

### Database Operations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 📦 Production Deployment

### Vercel (Recommended)
```bash
# Build for production
npm run build

# Deploy
vercel --prod
```

### Environment Variables (Production)
Ensure all production environment variables are set:
- `DATABASE_URL` - Production PostgreSQL with PostGIS
- `FIREBASE_*` - Production Firebase credentials
- `PARTNER_API_KEY` - Secure 32+ character key
- `ALLOWED_ORIGINS` - Production domain(s)

## 🔍 Monitoring

### Health Checks
- `GET /v1/health` - Database connectivity check
- `GET /v1/status` - Runtime information

### Logging
- Request IDs for tracing
- Structured JSON logs
- Error categorization
- Performance metrics

## 🧪 Testing Strategy

### Unit Tests
- Utility functions (geo calculations, validation)
- Error handling classes
- Input validation schemas

### Integration Tests  
- API endpoint responses
- Database operations
- Authentication flows

### Load Testing
- Rate limiting verification
- Performance under load
- Database query optimization

## 🤝 Contributing

1. **Follow TypeScript strict mode**
2. **Add tests for new features**  
3. **Update documentation**
4. **Use conventional commits**
5. **Ensure all linting passes**

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: `/v1/docs` endpoint
- **API Reference**: OpenAPI specification

---

**Status**: ✅ Production Ready  
**Version**: 9.0.0  
**Last Updated**: January 2025
