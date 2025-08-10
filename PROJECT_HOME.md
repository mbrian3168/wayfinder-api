# 🧭 Wayfinder API - Project Home

> **Local Development Hub for Wayfinder GPS Travel-Tech Platform**

## 📍 Project Overview

Wayfinder transforms car rides into narrated, immersive journeys using real-time GPS data to trigger audio storytelling, dynamic music, trivia, and branded Points of Interest (POIs). This repository contains the core backend API that powers the entire platform.

**Target Partners:** Theme parks, cruise lines, tourism boards, location-based entertainment companies

---

## 🎯 Current Project Status

### ✅ Completed Infrastructure
- **API Deployment**: Live on Vercel (production-ready)
- **Backend Stack**: Node.js + TypeScript + Express + Prisma + Firebase + NeonDB
- **Version Control**: GitHub repo fully synced and structured
- **Database**: Prisma schema deployed to Neon PostgreSQL
- **Environment**: Secure configuration management
- **Landing Page**: Branded presentation at root URL

### 🚧 Current Phase: API Foundation Hardening
**Focus**: Building confidence in API reliability, test coverage, and internal logic

**Next 3 Critical Actions:**
1. **Generate Postman Collection** - Test all endpoints live on Vercel
2. **Implement Controller Logic** - Core routes: partner, trip, audio, sdk
3. **Add Firebase Middleware + Rate Limiting** - Harden all routes

---

## 🔄 Development Workflow

### Daily Startup Protocol
```bash
# 1. Check project status
cd C:\Users\Matt\wayfinder-api\wayfinder-api

# 2. Pull latest changes
git pull origin main

# 3. Install any new dependencies
npm install

# 4. Start development environment
npm run dev

# 5. Check health status
curl http://localhost:8080/v1/health
```

### Before Starting Work
1. **Check Notion Task Tracker**: https://www.notion.so/38d1ef6d75c0453b8939356e3327198a
2. **Review current phase priorities** in Project Hub
3. **Update task status** to "🔄 In Progress"
4. **Note any blockers** or dependencies

### After Completing Work
1. **Update task status** to "✅ Complete"
2. **Add completion notes** with relevant details
3. **Commit and push changes** with descriptive messages
4. **Update "Last Updated"** timestamp in Notion
5. **Log next recommended step** in task notes

---

## 🚀 Quick Start Commands

### Development Server
```bash
# Start dev server with hot reload
npm run dev

# Start in production mode
npm start

# Build for production
npm run build
```

### Database Operations
```bash
# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Testing & Quality
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Code formatting
npm run format

# Full quality check
npm run lint && npm test && npx tsc --noEmit
```

---

## 📊 Project Structure

```
wayfinder-api/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, validation, rate limiting
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── types/           # TypeScript definitions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── docs/                # Additional documentation
├── scripts/             # Utility scripts
└── tests/               # Test files
```

---

## 🔗 Key URLs & Resources

### Local Development
- **Dev Server**: http://localhost:8080
- **API Health**: http://localhost:8080/v1/health
- **API Docs**: http://localhost:8080/v1/docs
- **Prisma Studio**: http://localhost:5555

### Production
- **Live API**: https://wayfinder-api.vercel.app
- **Production Health**: https://wayfinder-api.vercel.app/v1/health
- **Production Docs**: https://wayfinder-api.vercel.app/v1/docs

### Project Management
- **Notion Project Hub**: https://www.notion.so/24bd8f5ec00b81f288ccd52229ec6e70
- **Task Tracker**: https://www.notion.so/38d1ef6d75c0453b8939356e3327198a
- **GitHub Repository**: [Your GitHub URL]

---

## 🛠️ Development Environment

### Required Software
- **Node.js**: v20.x (LTS)
- **npm**: v10.x
- **Git**: Latest version
- **VS Code**: Recommended editor
- **Postman**: API testing (or similar)

### VS Code Extensions (Recommended)
- Prisma
- TypeScript Importer
- ESLint
- Prettier
- GitLens
- Thunder Client (API testing)

### Environment Variables
Located in `.env` file (never commit this file):
```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL=...
PARTNER_API_KEY=...
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 📋 Phase Roadmap

### 🚧 Phase 1: API Foundation (Current)
**Completion Criteria**: All critical/high priority tasks done
- ✅ Basic infrastructure setup
- 🔄 API endpoint testing and hardening
- ⏳ Security middleware implementation
- ⏳ Comprehensive test coverage
- ⏳ API documentation generation

### 🧱 Phase 2: Partner Portal
**Prerequisites**: Secure API endpoints completed
- Partner login via Firebase
- POI & Trip content management UI
- Real-time preview/scheduling interface
- Basic analytics dashboard
- **Stack**: Next.js + Firebase Auth + Tailwind

### 📱 Phase 3: Mobile App & SDK
**Prerequisites**: Partner portal MVP completed
- Background GPS detection
- Location-triggered TTS audio
- Dual persona voice system (Navigator + Host)
- Companion trivia, music layering, POI links
- Analytics beacon for partner reporting

### 💼 Phase 4: Monetization & Scaling
**Prerequisites**: Working mobile app and SDK
- Stripe tiered billing/subscriptions
- API usage tracking and quotas
- Admin tools for partner onboarding
- Legal/privacy layers for consumer app

---

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check if Neon DB is accessible
npm run db:check

# Regenerate Prisma client
npx prisma generate
```

**TypeScript Errors**
```bash
# Clear compiled files and rebuild
rm -rf dist/
npm run build
```

**Git Push Rejected**
```bash
# Force pull latest changes
git pull origin main --rebase
git push origin main
```

**Port Already in Use**
```bash
# Kill process using port 8080
npx kill-port 8080

# Or use different port
PORT=3001 npm run dev
```

### Getting Help
1. **Check logs**: `npm run dev` shows detailed error messages
2. **Review Notion**: Task tracker often has solutions to common blockers
3. **GitHub Issues**: Document any persistent problems
4. **API Docs**: http://localhost:8080/v1/docs for endpoint specifications

---

## 📈 Success Metrics

### Phase 1 Completion Indicators
- [ ] All API endpoints tested with Postman
- [ ] Controller logic implemented and functional
- [ ] Firebase authentication middleware active
- [ ] Rate limiting preventing abuse
- [ ] Unit test coverage >80%
- [ ] API documentation generated and accessible

### Quality Standards
- **Code Coverage**: Minimum 80% test coverage
- **Type Safety**: Zero TypeScript errors
- **Performance**: <200ms average response time
- **Security**: All endpoints properly authenticated
- **Documentation**: All public endpoints documented

---

## 🎯 Next Actions

**Immediate (This Week)**
1. Generate comprehensive Postman collection
2. Complete controller logic implementation
3. Add Firebase Admin middleware to all protected routes