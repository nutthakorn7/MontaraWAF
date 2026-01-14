# Montara WAF

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4)
![Tests](https://img.shields.io/badge/Tests-43%20passing-green)
![Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0-green)

Enterprise-grade Web Application Firewall Dashboard built with Next.js 16, React 19, and Tailwind CSS 4.

## ✨ Features

- 🛡️ **Security Dashboard** - Real-time security metrics and threat visualization
- 📊 **Attack Analytics** - Detailed attack pattern analysis with interactive charts
- 📋 **WAF Policies** - Manage and configure WAF rules
- 🌍 **Geo-blocking** - Country-based traffic control
- 🤖 **Bot Protection** - Automated bot detection and mitigation
- 🔒 **DDoS Protection** - Layer 3/4/7 DDoS mitigation
- 🌙 **Dark/Light Mode** - Full theme support
- 📱 **Responsive** - Works on all device sizes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3001
```

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run component tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:coverage` | Run tests with coverage |
| `npm run storybook` | Start Storybook |
| `npm run analyze` | Analyze bundle size |

## 🧪 Testing

### Component Tests (Vitest)
```bash
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

### E2E Tests (Playwright)
```bash
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Interactive UI mode
npm run test:e2e:report  # View HTML report
```

### Test Coverage
- **43 tests** total
- Component tests: 21
- E2E tests: 14
- Accessibility: 3
- Performance: 5

## 🐳 Docker

```bash
# Build image
docker build -t montara-waf:latest .

# Run container
docker run -d -p 3000:3000 montara-waf:latest

# With environment variables
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api.example.com \
  montara-waf:latest
```

## 📁 Project Structure

```
montara-waf/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── charts/       # Chart components
│   │   └── auth/         # Authentication components
│   ├── context/          # React contexts
│   └── __tests__/        # Component tests
├── e2e/                  # Playwright E2E tests
├── .storybook/           # Storybook configuration
├── .github/workflows/    # GitHub Actions CI/CD
└── public/               # Static assets
```

## 🎨 UI Components

24 reusable components documented in Storybook:

```bash
npm run storybook  # View at http://localhost:6006
```

Components include: Button, Badge, Card, Table, Modal, Tabs, Select, Toast, and more.

## 🔐 Authentication

Mock authentication is available for demo/development:

- Email: `any@email.com`
- Password: min 4 characters

Routes are protected - unauthenticated users are redirected to `/login`.

## 🔄 CI/CD

GitHub Actions workflows:

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | Push/PR | Lint, Test, E2E, Build |
| `deploy.yml` | Push to main | Docker build & push |
| `storybook.yml` | Push/PR | Build Storybook |
| `security.yml` | Weekly | npm audit |

## 📊 Performance

| Metric | Value |
|--------|-------|
| First Contentful Paint | ~140ms |
| Time to Interactive | ~170ms |
| Bundle Size | 1.2MB |
| Lighthouse Score | 90+ |

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1
- **UI**: React 19, Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Testing**: Vitest, Playwright
- **Docs**: Storybook 10

## 📝 License

MIT

---

Built with ❤️ for Pop7
