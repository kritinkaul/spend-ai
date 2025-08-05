# 💰 SpendAI - AI-Powered Personal Finance Analysis Platform

**Comprehensive Financial Analytics Dashboard | Built by Kritin Kaul**

A modern, full-stack personal finance application that uses AI to analyze spending patterns, provide insights, and help users make better financial decisions.

## 🚀 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black)
![React](https://img.shields.io/badge/React-18.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000)

## 🎯 Quick Actions

[![Live Demo](https://img.shields.io/badge/Live_Demo-🌐_Visit_App-blue?style=for-the-badge)](https://spend-ai-lime.vercel.app)
[![Documentation](https://img.shields.io/badge/Documentation-📚_Read_More-green?style=for-the-badge)](./QUICK_START.md)
[![Deploy](https://img.shields.io/badge/Deploy-🚀_Deploy_Your_Own-orange?style=for-the-badge)](./DEPLOYMENT.md)

## 🎯 Project Overview

SpendAI is a comprehensive personal finance analytics platform that demonstrates full-stack development capabilities, AI integration expertise, and modern web development best practices. Built for financial management, this platform processes bank statements, provides AI-powered insights, and offers real-time financial analytics across multiple data sources.

## 💡 Key Value Propositions

**For Users:**
- 📊 **Smart Analytics**: AI-powered spending pattern analysis and trend detection
- 💳 **Multi-Format Support**: Process CSV and PDF bank statements seamlessly
- 📈 **Real-time Dashboard**: Beautiful visualizations and interactive charts
- 🎯 **Category Intelligence**: Automated expense categorization and insights
- 📱 **Responsive Design**: Works perfectly on all devices and screen sizes

**For Developers:**
- 🏗️ **Modern Architecture**: TypeScript, React 18, Node.js, PostgreSQL
- 🔧 **Production Ready**: Docker, CI/CD, environment management
- 📚 **Comprehensive Docs**: Detailed deployment and development guides
- 🚀 **Easy Deployment**: One-click deployment to Vercel and Railway

## 🚀 Tech Stack

### Backend
- **Node.js** with **TypeScript** - Modern, type-safe server development
- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Production-ready relational database
- **Prisma ORM** - Type-safe database client and migrations
- **JWT Authentication** - Secure user authentication
- **Redis** - Caching and session management
- **Docker** - Containerized development environment

### Frontend
- **React 18** with **TypeScript** - Modern UI development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **Recharts** - Beautiful data visualization
- **React Hook Form** - Performant forms

### DevOps & Tools
- **Docker Compose** - Multi-container development environment
- **ESLint** & **Prettier** - Code quality and formatting
- **Jest** & **Vitest** - Testing framework
- **Git** - Version control

## 🎯 Features

- **Smart Upload** - CSV & PDF bank statement processing
- **AI-Powered Analytics** - Advanced spending insights and trends
- **Real-time Dashboard** - Beautiful charts and visualizations
- **Category Analysis** - Automated expense categorization
- **Stock Data** - Real-time market information and analysis
- **Responsive Design** - Works perfectly on all devices

## 🚀 Deployment Status

- ✅ **Frontend**: Deployed on Vercel
- ✅ **Backend**: Ready for Railway deployment
- ✅ **Database**: PostgreSQL configuration ready
- ✅ **Live Demo**: https://spend-ai-lime.vercel.app

## 🚀 Deployment

### Frontend (Vercel)
See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

**Quick Steps:**
1. Connect your GitHub repo to Vercel
2. Set environment variable: `VITE_API_URL=https://your-backend-url.railway.app`
3. Deploy!

### Backend (Railway)
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🚀 Quick Start

### Local Development

#### Using the Simple Start Script (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd spend-ai

# Make the script executable and run it
chmod +x start-simple.sh
./start-simple.sh
```

This script will:
- Install all dependencies for both frontend and backend
- Set up environment variables
- Start both servers automatically
- Open the app in your browser

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Live Demo**: https://spend-ai-lime.vercel.app

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
spend-ai/
├── frontend/           # React app
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # App pages
│   │   ├── services/   # API calls
│   │   └── hooks/      # Custom React hooks
│   └── package.json
├── backend/            # Express server
│   ├── src/            # TypeScript source
│   ├── routes/         # API routes
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Express middleware
│   └── package.json
└── shared/             # Shared utilities
```

## 💡 Usage

1. **Open the App**: Visit [http://localhost:3000](https://spend-ai-lime.vercel.app)
2. **Upload Data**: Go to the Upload page and drag & drop your bank statement (CSV or PDF)
3. **View Analytics**: Check the Dashboard for spending insights and trends
4. **Explore Categories**: See your spending breakdown by category in Analysis
5. **Monitor Stocks**: Use the Stocks page for market data and analysis

## 🔧 Development

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories:

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:8000
VITE_FINNHUB_API_KEY=your_finnhub_key
```

**Backend `.env**:
```
PORT=8000
DATABASE_URL="file:./data/spendai.db"
NODE_ENV=development
```

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests  
cd backend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the troubleshooting guide in `QUICK_START.md`

## 📄 License

This project is licensed under the MIT License.

---

**SpendAI** - Transform your financial data into actionable insights! 💰✨ 
