import { useState, useEffect, useRef } from 'react';
import './App.css';

type TimerMode = 'focus' | 'break' | 'longBreak';

const DEFAULT_FOCUS_TIME = 25 * 60;
const DEFAULT_BREAK_TIME = 5 * 60;
const DEFAULT_LONG_BREAK_TIME = 30 * 60;

const POMODORO_CYCLE_COUNT = 5;
const MODE_SWITCH_DELAY = 2000;

const STORAGE_KEYS = {
  AUTO_SWITCH: 'tomato-autoSwitch',
  AUTO_START: 'tomato-autoStart',
  ENABLE_NOTIFICATIONS: 'tomato-enableNotifications',
  CUSTOM_FOCUS_TIME: 'tomato-customFocusTime',
  CUSTOM_BREAK_TIME: 'tomato-customBreakTime',
  CUSTOM_LONG_BREAK_TIME: 'tomato-customLongBreakTime',
  CURRENT_MODE: 'tomato-current-mode',
} as const;

function App() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SWITCH);
    return saved ? saved === 'true' : true;
  });
  const [autoStart, setAutoStart] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_START);
    return saved ? saved === 'true' : true;
  });
  const [enableNotifications, setEnableNotifications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS);
    if (saved !== null) {
      return saved === 'true';
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      return true;
    }
    return false;
  });
  const [pomodoroCycle, setPomodoroCycle] = useState(1);
  const [completionGuard, setCompletionGuard] = useState(false);

  const [customFocusTime, setCustomFocusTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOCUS_TIME);
    if (saved !== null) {
      const time = parseInt(saved, 10);
      if (!isNaN(time) && time >= 60 && time <= 7200) {
        return time;
      }
    }
    return DEFAULT_FOCUS_TIME;
  });
  const [customBreakTime, setCustomBreakTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_BREAK_TIME);
    if (saved !== null) {
      const time = parseInt(saved, 10);
      if (!isNaN(time) && time >= 60 && time <= 7200) {
        return time;
      }
    }
    return DEFAULT_BREAK_TIME;
  });
  const [customLongBreakTime, setCustomLongBreakTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME);
    if (saved !== null) {
      const time = parseInt(saved, 10);
      if (!isNaN(time) && time >= 60 && time <= 7200) {
        return time;
      }
    }
    return DEFAULT_LONG_BREAK_TIME;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const currentMode = localStorage.getItem(STORAGE_KEYS.CURRENT_MODE) as TimerMode || 'focus';
    if (currentMode === 'focus') {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOCUS_TIME);
      if (saved !== null) {
        const time = parseInt(saved, 10);
        if (!isNaN(time) && time >= 60 && time <= 7200) {
          return time;
        }
      }
      return DEFAULT_FOCUS_TIME;
    } else if (currentMode === 'break') {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_BREAK_TIME);
      if (saved !== null) {
        const time = parseInt(saved, 10);
        if (!isNaN(time) && time >= 60 && time <= 7200) {
          return time;
        }
      }
      return DEFAULT_BREAK_TIME;
    } else {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME);
      if (saved !== null) {
        const time = parseInt(saved, 10);
        if (!isNaN(time) && time >= 60 && time <= 7200) {
          return time;
        }
      }
      return DEFAULT_LONG_BREAK_TIME;
    }
  });

  const getFocusTime = () => customFocusTime;
  const getBreakTime = () => customBreakTime;
  const getLongBreakTime = () => customLongBreakTime;

  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadSettings = () => {
      try {
        console.log('=== Loading settings from localStorage ===');

        const allKeys = Object.keys(localStorage);
        console.log('All localStorage keys:', allKeys);

        const savedAutoSwitch = localStorage.getItem(STORAGE_KEYS.AUTO_SWITCH);
        console.log('Raw autoSwitch value:', savedAutoSwitch);
        if (savedAutoSwitch !== null) {
          setAutoSwitch(savedAutoSwitch === 'true');
          console.log('✓ Loaded autoSwitch:', savedAutoSwitch === 'true');
        } else {
          console.log('⚠ autoSwitch not found, using default');
        }

        const savedAutoStart = localStorage.getItem(STORAGE_KEYS.AUTO_START);
        console.log('Raw autoStart value:', savedAutoStart);
        if (savedAutoStart !== null) {
          setAutoStart(savedAutoStart === 'true');
          console.log('✓ Loaded autoStart:', savedAutoStart === 'true');
        } else {
          console.log('⚠ autoStart not found, using default');
        }

        const savedEnableNotifications = localStorage.getItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS);
        console.log('Raw enableNotifications value:', savedEnableNotifications);
        if (savedEnableNotifications !== null) {
          setEnableNotifications(savedEnableNotifications === 'true');
          console.log('✓ Loaded enableNotifications:', savedEnableNotifications === 'true');
        } else {
          console.log('⚠ enableNotifications not found, using default');
        }

        const savedFocusTime = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOCUS_TIME);
        console.log('Raw focusTime value:', savedFocusTime);
        if (savedFocusTime !== null) {
          const time = parseInt(savedFocusTime, 10);
          if (!isNaN(time) && time >= 60 && time <= 7200) {
            setCustomFocusTime(time);
            console.log('✓ Loaded focusTime:', time, 'seconds (', time / 60, 'minutes)');
          } else {
            console.log('⚠ Invalid focusTime, using default');
          }
        } else {
          console.log('⚠ focusTime not found, using default');
        }

        const savedBreakTime = localStorage.getItem(STORAGE_KEYS.CUSTOM_BREAK_TIME);
        console.log('Raw breakTime value:', savedBreakTime);
        if (savedBreakTime !== null) {
          const time = parseInt(savedBreakTime, 10);
          if (!isNaN(time) && time >= 60 && time <= 7200) {
            setCustomBreakTime(time);
            console.log('✓ Loaded breakTime:', time, 'seconds (', time / 60, 'minutes)');
          } else {
            console.log('⚠ Invalid breakTime, using default');
          }
        } else {
          console.log('⚠ breakTime not found, using default');
        }

        const savedLongBreakTime = localStorage.getItem(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME);
        console.log('Raw longBreakTime value:', savedLongBreakTime);
        if (savedLongBreakTime !== null) {
          const time = parseInt(savedLongBreakTime, 10);
          if (!isNaN(time) && time >= 60 && time <= 7200) {
            setCustomLongBreakTime(time);
            console.log('✓ Loaded longBreakTime:', time, 'seconds (', time / 60, 'minutes)');
          } else {
            console.log('⚠ Invalid longBreakTime, using default');
          }
        } else {
          console.log('⚠ longBreakTime not found, using default');
        }

        console.log('=== Settings loading complete ===');
      } catch (error) {
        console.error('❌ Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const current = localStorage.getItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS);
        if (current !== 'true') {
          console.log('Browser permission granted, enabling notifications');
          setEnableNotifications(true);
          localStorage.setItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS, 'true');
        }
      } catch (error) {
        console.error('Failed to sync notification permission:', error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      console.log('Saving autoSwitch:', autoSwitch);
      localStorage.setItem(STORAGE_KEYS.AUTO_SWITCH, String(autoSwitch));
    } catch (error) {
      console.error('Failed to save autoSwitch:', error);
    }
  }, [autoSwitch]);

  useEffect(() => {
    try {
      console.log('Saving autoStart:', autoStart);
      localStorage.setItem(STORAGE_KEYS.AUTO_START, String(autoStart));
    } catch (error) {
      console.error('Failed to save autoStart:', error);
    }
  }, [autoStart]);

  useEffect(() => {
    try {
      console.log('Saving enableNotifications:', enableNotifications);
      localStorage.setItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS, String(enableNotifications));
    } catch (error) {
      console.error('Failed to save enableNotifications:', error);
    }
  }, [enableNotifications]);

  useEffect(() => {
    try {
      console.log('Saving customFocusTime:', customFocusTime);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FOCUS_TIME, String(customFocusTime));
    } catch (error) {
      console.error('Failed to save customFocusTime:', error);
    }
  }, [customFocusTime]);

  useEffect(() => {
    try {
      console.log('Saving customBreakTime:', customBreakTime);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_BREAK_TIME, String(customBreakTime));
    } catch (error) {
      console.error('Failed to save customBreakTime:', error);
    }
  }, [customBreakTime]);

  useEffect(() => {
    try {
      console.log('Saving customLongBreakTime:', customLongBreakTime);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LONG_BREAK_TIME, String(customLongBreakTime));
    } catch (error) {
      console.error('Failed to save customLongBreakTime:', error);
    }
  }, [customLongBreakTime]);

  useEffect(() => {
    const currentTime =
      mode === 'focus'
        ? getFocusTime()
        : mode === 'break'
        ? getBreakTime()
        : getLongBreakTime();
    setTimeLeft(currentTime);
  }, [mode]);

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
  }, [isRunning, mode, autoSwitch, autoStart, pomodoroCycle, customFocusTime, customBreakTime, customLongBreakTime]);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setEnableNotifications(true);
          try {
            localStorage.setItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS, 'true');
            console.log('✓ Notification permission granted and saved');
          } catch (error) {
            console.error('Failed to save notification permission:', error);
          }
        } else if (permission === 'denied') {
          console.log('⚠ Notification permission denied by user');
          setEnableNotifications(false);
          try {
            localStorage.setItem(STORAGE_KEYS.ENABLE_NOTIFICATIONS, 'false');
          } catch (error) {
            console.error('Failed to save notification permission:', error);
          }
        } else {
          console.log('ℹ Notification permission:', permission);
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
        ? getFocusTime()
        : newMode === 'break'
        ? getBreakTime()
        : getLongBreakTime();
    setTimeLeft(time);

    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, newMode);
    } catch (error) {
      console.error('Failed to save current mode:', error);
    }

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
        ? getFocusTime()
        : mode === 'break'
        ? getBreakTime()
        : getLongBreakTime(),
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

  const handleTimeChange = (timeType: TimerMode, minutes: number) => {
    const newTime = Math.max(1, Math.min(120, minutes)) * 60;
    if (timeType === 'focus') {
      setCustomFocusTime(newTime);
      if (mode === 'focus') {
        setTimeLeft(newTime);
        setCompletionGuard(false);
      }
    } else if (timeType === 'break') {
      setCustomBreakTime(newTime);
      if (mode === 'break') {
        setTimeLeft(newTime);
        setCompletionGuard(false);
      }
    } else if (timeType === 'longBreak') {
      setCustomLongBreakTime(newTime);
      if (mode === 'longBreak') {
        setTimeLeft(newTime);
        setCompletionGuard(false);
      }
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
          <h3 className="settings-title">时间设置</h3>

          <div className="settings-item">
            <label className="input-label">
              专注时长 (分钟):
              <input
                type="number"
                min="1"
                max="120"
                value={customFocusTime / 60}
                onChange={(e) => handleTimeChange('focus', parseInt(e.target.value) || 25)}
                className="number-input"
              />
            </label>
          </div>

          <div className="settings-item">
            <label className="input-label">
              短休息时长 (分钟):
              <input
                type="number"
                min="1"
                max="120"
                value={customBreakTime / 60}
                onChange={(e) => handleTimeChange('break', parseInt(e.target.value) || 5)}
                className="number-input"
              />
            </label>
          </div>

          <div className="settings-item">
            <label className="input-label">
              长休息时长 (分钟):
              <input
                type="number"
                min="1"
                max="120"
                value={customLongBreakTime / 60}
                onChange={(e) => handleTimeChange('longBreak', parseInt(e.target.value) || 30)}
                className="number-input"
              />
            </label>
          </div>

          <hr className="settings-divider" />

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
