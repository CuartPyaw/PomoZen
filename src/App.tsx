import { useState, useEffect, useRef } from 'react';
import './App.css';

type TimerMode = 'focus' | 'break' | 'longBreak';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 30 * 60;

const POMODORO_CYCLE_COUNT = 5;
const MODE_SWITCH_DELAY = 2000;

function App() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [autoStart, setAutoStart] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [pomodoroCycle, setPomodoroCycle] = useState(1);
  const [completionGuard, setCompletionGuard] = useState(false);

  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      setCompletionGuard(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, autoSwitch, autoStart, pomodoroCycle]);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setEnableNotifications(true);
        }
      });
    }
  };

  const sendNotification = (title: string, body: string) => {
    if (enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  const handleTimerComplete = () => {
    if (completionGuard) {
      return;
    }
    setCompletionGuard(true);

    setIsRunning(false);

    let nextMode: TimerMode | null = null;

    if (mode === 'focus') {
      nextMode = 'break';
    } else if (mode === 'break') {
      if (pomodoroCycle >= POMODORO_CYCLE_COUNT) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'focus';
      }
    } else if (mode === 'longBreak') {
      nextMode = 'focus';
    }

    if (nextMode) {
      if (mode === 'focus') {
        sendNotification('专注结束', '时间到了！该休息一下了');
      } else if (mode === 'break') {
        sendNotification('休息结束', '休息完成！开始专注吧');
      } else if (mode === 'longBreak') {
        sendNotification('长休息结束', '休息完成！开始新的番茄钟周期');
      }
    }

    if (!autoSwitch) {
      return;
    }

    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
    }

    switchTimeoutRef.current = setTimeout(() => {
      if (mode === 'focus') {
        switchToMode('break', autoStart);
      } else if (mode === 'break') {
        if (pomodoroCycle >= POMODORO_CYCLE_COUNT) {
          switchToMode('longBreak', autoStart);
        } else {
          setPomodoroCycle(pomodoroCycle + 1);
          switchToMode('focus', autoStart);
        }
      } else if (mode === 'longBreak') {
        setPomodoroCycle(1);
        switchToMode('focus', autoStart);
      }
    }, MODE_SWITCH_DELAY);
  };

  const switchToMode = (newMode: TimerMode, shouldAutoStart: boolean = false) => {
    setCompletionGuard(false);
    setMode(newMode);
    const time =
      newMode === 'focus'
        ? FOCUS_TIME
        : newMode === 'break'
        ? BREAK_TIME
        : LONG_BREAK_TIME;
    setTimeLeft(time);

    setIsRunning(shouldAutoStart);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (!isRunning) {
      setCompletionGuard(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCompletionGuard(false);
    setTimeLeft(
      mode === 'focus'
        ? FOCUS_TIME
        : mode === 'break'
        ? BREAK_TIME
        : LONG_BREAK_TIME,
    );
    setPomodoroCycle(1);
  };

  const handleManualModeToggle = (newMode: TimerMode) => {
    setPomodoroCycle(1);
    setCompletionGuard(false);
    switchToMode(newMode, false);
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setEnableNotifications(enabled);
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }
  };

  const getCycleInfo = () => {
    if (mode === 'longBreak') {
      return `长休息`;
    }
    return `番茄钟周期: ${pomodoroCycle}/${POMODORO_CYCLE_COUNT}`;
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'focus':
        return '专注时间';
      case 'break':
        return '短休息';
      case 'longBreak':
        return '长休息';
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1 className="title">番茄钟</h1>
        </div>

        <div className="mode-toggle">
          <button
            className={`mode-button ${mode === 'focus' ? 'active' : ''}`}
            onClick={() => {
              if (mode !== 'focus') handleManualModeToggle('focus');
            }}
          >
            专注
          </button>
          <button
            className={`mode-button ${mode === 'break' ? 'active' : ''}`}
            onClick={() => {
              if (mode !== 'break') handleManualModeToggle('break');
            }}
          >
            短休息
          </button>
          <button
            className={`mode-button ${mode === 'longBreak' ? 'active' : ''}`}
            onClick={() => {
              if (mode !== 'longBreak') handleManualModeToggle('longBreak');
            }}
          >
            长休息
          </button>
        </div>

        <div className="timer-display">
          <div className="time">{formatTime(timeLeft)}</div>
          <div className="mode-label">{getModeLabel()}</div>
          {autoSwitch && <div className="cycle-info">{getCycleInfo()}</div>}
        </div>

        <div className="controls">
          <button className="control-button primary" onClick={handleStartPause}>
            {isRunning ? '暂停' : '开始'}
          </button>
          <button className="control-button secondary" onClick={handleReset}>
            重置
          </button>
        </div>
      </div>

      <button
        className={`settings-button ${showSettings ? 'active' : ''}`}
        onClick={() => setShowSettings(!showSettings)}
        aria-label="设置"
      >
        ⚙️
      </button>

      {showSettings && (
        <div className="settings-panel">
          <h3 className="settings-title">自动切换设置</h3>

          <label className="settings-label">
            <input
              type="checkbox"
              checked={autoSwitch}
              onChange={(e) => setAutoSwitch(e.target.checked)}
              className="checkbox"
            />
            启用自动切换模式
          </label>

          <label className="settings-label">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              className="checkbox"
            />
            自动切换模式时自动开始计时
          </label>

          <label className="settings-label">
            <input
              type="checkbox"
              checked={enableNotifications}
              onChange={(e) => handleNotificationToggle(e.target.checked)}
              className="checkbox"
            />
            启用桌面通知
          </label>

          {enableNotifications && 'Notification' in window && Notification.permission !== 'granted' && (
            <div className="notification-permission">
              <button className="permission-button" onClick={requestNotificationPermission}>
                授权通知权限
              </button>
            </div>
          )}

          {enableNotifications && 'Notification' in window && Notification.permission === 'granted' && (
            <div className="notification-status">✓ 通知已启用</div>
          )}

          {enableNotifications && !('Notification' in window) && (
            <div className="notification-status">⚠️ 当前浏览器不支持通知</div>
          )}

          {autoSwitch && (
            <div className="settings-info">
              <strong>循环模式:</strong>
              <br />
              专注 → 短休息 (重复 {POMODORO_CYCLE_COUNT} 次) → 长休息
              <br />
              <small>注意: 只有自动切换时才会自动开始，手动切换需要点击"开始"</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
