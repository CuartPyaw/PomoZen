# PomoZen

[![English](https://img.shields.io/badge/lang-English-blue.svg)](README.md) [![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](README.zh-CN.md)

> A modern Pomodoro timer application with Linear-inspired design aesthetic.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-cyan)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **Three Timer Modes**: Focus (25min), Short Break (5min), Long Break (30min)
- **Web Worker Timer**: Accurate countdown unaffected by browser throttling or tab focus
- **Auto-Switch**: Automatic progression through Pomodoro cycles
- **Desktop Notifications**: Browser-native alerts when timer completes
- **Statistics Dashboard**: Visualize focus history with interactive charts
- **State Persistence**: Timer state and settings saved to localStorage
- **Dark Theme**: Modern Linear-inspired aesthetic with animated background
- **Multiple Deployment Options**: Support for Vercel, Docker, and static hosting

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18.3.1 + TypeScript |
| **Build Tool** | Vite 6.0.3 |
| **UI Library** | Material-UI (MUI) 7.3.7 |
| **Charts** | Recharts 3.7.0, Chart.js 4.5.1 |
| **Styling** | Emotion (CSS-in-JS) + Custom CSS |
| **Deployment** | Vercel, Docker + Nginx |

---

## Project Structure

```
tomato-clock/
├── src/
│   ├── components/
│   │   └── Charts/                 # Statistics chart components
│   ├── styles/
│   │   └── background.css          # Animated gradient background
│   ├── theme/
│   │   └── index.ts                # MUI dark theme configuration
│   ├── types/
│   │   ├── statistics.ts           # Statistics type definitions
│   │   └── worker.ts               # Web Worker communication types
│   ├── workers/
│   │   └── timerWorker.ts          # Timer logic in Web Worker
│   ├── App.tsx                     # Main application component (~2200 lines)
│   ├── App.css                     # Component-specific styles
│   ├── index.css                   # Global CSS reset
│   └── main.tsx                    # Application entry point
├── public/                         # Static assets
├── Dockerfile                      # Docker image build
├── docker-compose.yml              # Docker Compose configuration
├── nginx.conf                      # Nginx server configuration
└── vite.config.ts                  # Vite build configuration
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/CuartPyaw/tomato-clock.git
cd tomato-clock

# Install dependencies
npm ci
```

### Development

```bash
# Start development server with HMR
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Production Build

```bash
# Build for production (TypeScript check + Vite build)
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment

### Option 1: Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CuartPyaw/tomato-clock)

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts to complete the deployment. Vercel will automatically detect your Vite + React project configuration.

**Deploy to production:**
```bash
vercel --prod
```

#### Using Vercel Dashboard

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and click "Add New" → "Project"
3. Import your repository
4. Click "Deploy"

Vercel will automatically configure:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite

#### Optional: Create vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite"
}
```

---

### Option 2: Docker

#### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

#### Manual Docker Build

```bash
# Build the image
docker build -t tomato-clock .

# Run the container
docker run -d -p 8080:80 --name tomato-clock tomato-clock
```

Visit `http://localhost:8080` after container starts.

---

### Option 3: Static Hosting

After building the project, you can deploy the `dist/` folder to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Push to `gh-pages` branch
- **AWS S3 + CloudFront**: Upload to S3 bucket
- **Firebase Hosting**: `firebase init` + `firebase deploy`

---

## Usage

### Timer Modes

1. **Focus Mode** (default 25 minutes): Concentrate on your work
2. **Short Break** (default 5 minutes): Rest between focus sessions
3. **Long Break** (default 30 minutes): Extended rest after 5 focus sessions

### Controls

- **Play/Pause**: Start or pause the current timer
- **Reset**: Reset current timer to initial duration
- **Skip Next**: Manually advance to next mode
- **Settings**: Customize durations and toggle features

### Settings Options

| Setting | Description |
|---------|-------------|
| Custom Duration | Set custom time for each mode (in minutes) |
| Auto Switch | Automatically progress to next mode after completion |
| Auto Start | Automatically begin next timer without manual intervention |
| Notifications | Enable desktop notifications when timer completes |

### Statistics

Access the statistics dialog to view:
- Daily focus time trends (line chart)
- Weekly focus session distribution (bar chart)
- Monthly focus patterns (line chart)
- Time distribution heatmap (hourly focus patterns)
- Total focus time and session count
- Configurable time range (7/30/90 days or all)

---

## Architecture

### Web Worker Timer Pattern

The timer runs in a Web Worker (`src/workers/timerWorker.ts`) to ensure accurate timing regardless of browser throttling or tab focus state.

**Worker Communication:**
- `WorkerCommand` (main → worker): START, PAUSE, RESUME, RESET, SET_TIME
- `WorkerMessage` (worker → main): UPDATE (every second), COMPLETE

Each timer mode (`focus`, `break`, `longBreak`) maintains independent state in the worker, enabling parallel timer tracking.

### State Persistence

All application state is persisted to localStorage with prefixed keys (`tomato-*`). Recovery mechanism on app init:

1. Reads saved mode and time-left values
2. Restores `wasRunning` flags to determine auto-resume behavior
3. Recreates worker state with saved values

---

## Configuration

### Path Aliases

TypeScript path alias `@/*` maps to `src/*`:

```typescript
import { WorkerCommand } from '@/types/worker';
```

### Environment

No environment variables required for basic functionality. All settings are managed through the UI and stored in localStorage.

---

## Development Notes

### Common Pitfalls

**Date String Handling and Timezone Issues**

**Problem**: `new Date("YYYY-MM-DD")` parses date-only strings as UTC time (00:00:00 UTC), which can cause incorrect date comparisons in non-UTC timezones.

**Solution**: For date-only string comparisons, convert both dates to UTC string format using `toISOString().substring(0, 10)` before comparing.

```typescript
// ❌ Wrong: Fails in non-UTC timezones
const recordDate = new Date(record.date);
if (recordDate <= today) { ... }

// ✅ Correct: Use string comparison
const todayString = today.toISOString().substring(0, 10);
if (record.date <= todayString) { ... }
```

**Location**: See [src/App.tsx:1034-1064](src/App.tsx#L1034-L1064) for the corrected implementation.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

[MIT License](LICENSE)

---

## Acknowledgments

- [Pomodoro Technique](https://cirillocompany.com/pages/pomodoro-technique) by Francesco Cirillo
- [Linear](https://linear.app) design inspiration
- Built with [React](https://react.dev), [Vite](https://vitejs.dev), and [Material-UI](https://mui.com)

---

## Support

If you encounter any issues or have questions, please:

- Open an issue on GitHub
- Check existing documentation
- Review the [Architecture](#architecture) section for technical details

**Live Demo**: [Deploy your own instance and add the link here!]
