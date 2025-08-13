# 🧭 Wayfinder Partner Portal

A comprehensive web-based content management system for tourism partners to create, manage, and monitor location-based audio experiences for travelers.

## 🚀 Features

### 📊 Live Dashboard
- Real-time trip monitoring with auto-refreshing data
- Revenue tracking and performance metrics
- Executive summary with trend indicators
- Top-performing POIs rankings

### 🗺️ Points of Interest Management
- Comprehensive POI creation and editing
- Advanced filtering and search capabilities
- Bulk operations and priority classification
- Geographic coordinate management

### 🎵 Audio Content Management
- Multi-language audio creation with voice selection
- Text-to-speech integration
- Audio status tracking and preview
- Usage analytics and rating systems

### 📈 Analytics & Reporting
- Executive summary with revenue projections
- Usage patterns and peak hours visualization
- User segmentation and engagement metrics
- Export capabilities and trend analysis

### 🚗 Live Trip Monitoring
- Real-time trip tracking with progress bars
- Vehicle type and group size monitoring
- ETA calculations and status updates
- Performance metrics and engagement tracking

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Firebase Auth integration
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **State Management**: React hooks with real-time updates
- **API Integration**: RESTful endpoints with Wayfinder backend

## 📋 Prerequisites

- **Node.js** 20.x
- **npm** or **yarn**
- **Firebase Project** with Authentication enabled
- **Wayfinder API** access

## ⚡ Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd wayfinder-portal

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your Firebase configuration
nano .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_URL=https://wayfinder-api.vercel.app
```

### 3. Start Development Server

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard layout and pages
│   ├── pois/             # Points of Interest management
│   ├── audio/            # Audio content management
│   ├── analytics/        # Analytics and reporting
│   ├── trips/            # Live trip monitoring
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── auth/            # Authentication components
│   └── layout/          # Layout components
├── lib/                 # Utilities and configurations
│   ├── api.ts           # API client
│   ├── firebase.ts      # Firebase configuration
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
```

## 🔐 Authentication

The portal uses Firebase Authentication for secure partner access:

- **Email/Password**: Standard authentication
- **JWT Tokens**: Automatic token management
- **Protected Routes**: Dashboard requires authentication
- **Session Management**: Persistent login state

## 📊 Dashboard Features

### Revenue Analytics
- Real-time revenue tracking
- Upsell moment analytics
- ROI calculations and reporting
- Performance comparison tools

### Live Monitoring
- Real-time trip tracking
- Progress visualization
- ETA calculations
- Performance metrics

### Content Management
- POI creation and editing
- Audio content generation
- Status tracking
- Bulk operations

## 🎯 Key Metrics

- **Total Revenue**: Real-time revenue tracking
- **Active Trips**: Live journey monitoring
- **POI Engagement**: Content performance
- **User Satisfaction**: Rating and feedback

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables (Production)

Ensure all production environment variables are set in your deployment platform:

- `NEXT_PUBLIC_FIREBASE_*`: Production Firebase credentials
- `NEXT_PUBLIC_API_URL`: Production API endpoint

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Automatic formatting
- **Tailwind**: Utility-first CSS

## 📱 Responsive Design

The portal is fully responsive and optimized for:
- **Desktop**: Full feature access
- **Tablet**: Optimized layout
- **Mobile**: Touch-friendly interface

## 🔄 Real-time Updates

- **Auto-refresh**: Dashboard updates every 30 seconds
- **Live Trips**: Real-time trip monitoring
- **WebSocket Ready**: Prepared for real-time features
- **Performance**: Optimized for smooth updates

## 🎨 Design System

Built with a comprehensive design system:
- **Color Palette**: Consistent brand colors
- **Typography**: Scalable font system
- **Components**: Reusable UI components
- **Spacing**: Consistent layout system

## 📈 Performance

- **Fast Loading**: Optimized bundle size
- **Caching**: Intelligent data caching
- **Lazy Loading**: Component-level optimization
- **SEO Ready**: Meta tags and structured data

## 🔒 Security

- **Authentication**: Firebase Auth integration
- **API Security**: JWT token validation
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Secure error responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports
- **API Docs**: `/v1/docs` endpoint for API reference

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: January 2025
