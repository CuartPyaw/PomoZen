# Tomato Clock

> A modern Pomodoro timer application with Linear-inspired design aesthetic.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-cyan)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Three Timer Modes**: Focus (25min), Short Break (5min), Long Break (30min)
- **Web Worker Timer**: Accurate countdown unaffected by browser throttling or tab focus
- **Auto-Switch**: Automatic progression through Pomodoro cycles
- **Desktop Notifications**: Browser-native alerts when timer completes
- **Statistics Dashboard**: Visualize focus history with interactive charts
- **State Persistence**: Timer state and settings saved to localStorage
- **Dark Theme**: Modern Linear-inspired aesthetic with animated background
- **Docker Deployment**: Production-ready containerized deployment

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18.3.1 + TypeScript |
| **Build Tool** | Vite 6.0.3 |
| **UI Library** | Material-UI (MUI) 7.3.7 |
| **Charts** | Recharts 3.7.0 |
| **Styling** | Emotion (CSS-in-JS) + Custom CSS |
| **Deployment** | Docker + Nginx |

## Project Structure

```
tomato-clock/
├── src/
│   ├── components/
│   │   └── FocusCharts.tsx      # Statistics chart components
│   ├── styles/
│   │   └── background.css        # Animated gradient background
│   ├── theme/
│   │   └── index.ts              # MUI dark theme configuration
│   ├── types/
│   │   ├── statistics.ts         # Statistics type definitions
│   │   └── worker.ts             # Web Worker communication types
│   ├── workers/
│   │   └── timerWorker.ts        # Timer logic in Web Worker
│   ├── App.tsx                   # Main application component (~2200 lines)
│   ├── App.css                   # Component-specific styles
│   ├── index.css                 # Global CSS reset
│   └── main.tsx                  # Application entry point
├── public/                       # Static assets
├── Dockerfile                    # Docker image build
├── docker-compose.yml            # Docker Compose configuration
├── nginx.conf                    # Nginx server configuration
└── vite.config.ts                # Vite build configuration
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tomato-clock.git
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

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Manual Docker Build

```bash
# Build the image
docker build -t tomato-clock .

# Run the container
docker run -d -p 8080:80 --name tomato-clock tomato-clock
```

Visit `http://localhost:8080` after container starts.

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for complete deployment documentation.

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
- Total focus time and session count
- Configurable time range (7/14/30 days)

## Architecture

### Web Worker Timer Pattern

The timer runs in a Web Worker (`src/workers/timerWorker.ts`) to ensure accurate timing regardless of browser throttling or tab focus state.

**Worker Communication:**
- `WorkerCommand` (main → worker): START, PAUSE, RESUME, RESET, SET_TIME
- `WorkerMessage` (worker → main): UPDATE, COMPLETE

Each timer mode maintains independent state in the worker, enabling parallel timer tracking.

### State Persistence

All application state is persisted to localStorage with prefixed keys (`tomato-*`). Recovery mechanism on app init:

1. Reads saved mode and time-left values
2. Restores `wasRunning` flags to determine auto-resume behavior
3. Recreates worker state with saved values

## Configuration

### Path Aliases

TypeScript path alias `@/*` maps to `src/*`:

```typescript
import { WorkerCommand } from '@/types/worker';
```

### Environment

No environment variables required for basic functionality. All settings are managed through the UI and stored in localStorage.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Acknowledgments

- [Pomodoro Technique](https://cirillocompany.com/pages/pomodoro-technique) by Francesco Cirillo
- [Linear](https://linear.app) design inspiration
- Built with [React](https://react.dev), [Vite](https://vitejs.dev), and [Material-UI](https://mui.com)
