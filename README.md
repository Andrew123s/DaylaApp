# Dayla - Collaborative Trip Planning Platform

A comprehensive travel planning platform built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Core Platform
- **Real-time Collaboration**: Live editing, presence indicators, and instant notifications
- **Multi-language Support**: English, Spanish, French, German with instant switching
- **Dark/Light Mode**: Complete theme system with auto-detection
- **Responsive Design**: Mobile-first approach with seamless desktop experience

### Trip Planning
- **Interactive Planning Board**: Drag-and-drop sticky notes with real-time collaboration
- **Smart Scheduling**: Visual calendar with event management
- **Media Integration**: Image uploads, voice notes, and link attachments
- **Collaborative Editing**: Live presence indicators and conflict resolution

### Budget Management
- **Comprehensive Expense Tracking**: Split bills, receipt uploads, and category management
- **Integrated Payment System**: Secure payment processing with multiple methods
- **Real-time Settlement**: Instant payment status updates and notifications
- **Advanced Filtering**: Filter by category, person, and payment status

### Sustainability Features (Sus Cal)
- **Carbon Footprint Calculator**: Track transport, accommodation, and activity emissions
- **Transport Comparison**: Compare different travel options and their environmental impact
- **Offset Marketplace**: Purchase verified carbon offsets from curated projects
- **Sustainability Goals**: Set and track environmental targets

### Smart Packing (Smart Pak)
- **Intelligent Packing Lists**: AI-powered suggestions based on destination and activities
- **Collaborative Packing**: Assign items to different travelers
- **Weight & Volume Tracking**: Monitor luggage constraints
- **Category Organization**: Organize by clothing, electronics, documents, etc.

### Communication
- **Real-time Chat**: Group and direct messaging with file sharing
- **Trip Notifications**: Stay updated on all trip changes
- **Community Forum**: Share experiences and get travel advice
- **Live Presence**: See who's online and what they're working on

### User Experience
- **Personalized Onboarding**: Tailored experience based on travel preferences
- **Profile Management**: Complete profile system with image uploads
- **Advanced Settings**: Granular control over notifications and privacy
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **Date-fns** for date manipulation
- **Vite** for build tooling

### Backend (Supabase)
- **PostgreSQL** database with Row Level Security
- **Real-time subscriptions** for live collaboration
- **Edge Functions** for serverless API endpoints
- **Authentication** with JWT tokens
- **File Storage** for images and documents

### Key Features
- **Real-time Collaboration**: WebSocket connections for instant updates
- **Secure Payments**: Integrated payment processing with multiple providers
- **File Uploads**: Secure image and document storage
- **Push Notifications**: Real-time alerts and updates
- **Offline Support**: Progressive Web App capabilities

## 🏗 Database Schema

### Core Tables
- `user_profiles` - Extended user information and preferences
- `trips` - Trip information with collaboration features
- `trip_collaborators` - User roles and permissions
- `sticky_notes` - Planning board notes with real-time editing
- `user_presence` - Live collaboration tracking

### Budget Management
- `trip_budgets` - Budget configuration and settings
- `expenses` - Expense tracking with splits
- `expense_splits` - Individual payment responsibilities
- `payments` - Payment processing and history
- `settlements` - Debt resolution between users

### Sustainability
- `trip_sustainability` - Carbon footprint tracking
- `transport_options` - Travel option comparisons
- `offset_projects` - Available carbon offset projects
- `offset_contributions` - User offset purchases

### Communication
- `chats` - Chat room configuration
- `chat_messages` - Message history
- `forum_posts` - Community discussions
- `trip_notifications` - System notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dayla-trip-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration file to set up the database schema
   - Configure authentication settings
   - Set up storage buckets for file uploads

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

### Supabase Setup

1. **Database Migration**
   - Copy the SQL from `supabase/migrations/create_complete_schema.sql`
   - Run it in your Supabase SQL editor

2. **Edge Functions**
   Deploy the edge functions for enhanced functionality:
   ```bash
   # Install Supabase CLI
   npm install -g @supabase/cli
   
   # Deploy functions
   supabase functions deploy trip-collaboration
   supabase functions deploy payment-processing
   supabase functions deploy sustainability-tracking
   supabase functions deploy chat-management
   ```

3. **Storage Buckets**
   Create the following storage buckets:
   - `avatars` - User profile images
   - `trip-media` - Trip-related files
   - `receipts` - Expense receipts

4. **Authentication**
   - Enable email/password authentication
   - Configure email templates
   - Set up redirect URLs

## 🔧 Configuration

### Environment Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Feature Flags
The platform includes several configurable features:
- Real-time collaboration
- Payment processing
- Sustainability tracking
- Community features

## 📱 Progressive Web App

Dayla is built as a PWA with:
- Offline functionality for viewing trips
- Push notifications for real-time updates
- App-like experience on mobile devices
- Fast loading with service worker caching

## 🔒 Security

### Data Protection
- Row Level Security (RLS) on all database tables
- JWT-based authentication
- Encrypted file storage
- HTTPS-only communication

### Privacy Features
- Granular privacy controls
- Data export capabilities
- Account deletion with data cleanup
- GDPR compliance features

## 🌍 Internationalization

### Supported Languages
- English (default)
- Spanish
- French
- German

### Adding New Languages
1. Add translations to `src/contexts/AuthContext.tsx`
2. Update the language selector in settings
3. Test all UI components with new language

## 🎨 Theming

### Dark/Light Mode
- System preference detection
- Manual theme switching
- Persistent theme selection
- Smooth transitions between themes

### Customization
- CSS custom properties for easy theming
- Tailwind CSS configuration
- Component-level style overrides

## 📊 Analytics & Monitoring

### Performance Monitoring
- Real-time performance metrics
- Error tracking and reporting
- User engagement analytics
- Database query optimization

### Business Metrics
- Trip creation and completion rates
- User collaboration patterns
- Payment processing success rates
- Sustainability goal achievements

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for git history

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- API documentation in `/docs`
- Component storybook for UI components
- Database schema documentation

### Community
- GitHub Discussions for questions
- Discord server for real-time help
- Regular community calls

### Enterprise Support
- Priority support available
- Custom feature development
- On-premise deployment options
- Training and onboarding assistance

---

Built with ❤️ by the Dayla team. Happy travels! ✈️