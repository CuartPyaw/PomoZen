/**
 * Popup 主组件
 * 与 Background Service Worker 通信，管理计时器
 */
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// 类型定义
type TimerMode = 'focus' | 'break' | 'longBreak';

interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  pomodoroCycle: number;
}

interface Settings {
  customFocusTime: number;
  customBreakTime: number;
  customLongBreakTime: number;
  autoSwitch: boolean;
  autoStart: boolean;
  soundEnabled: boolean;
  autoSkipNotification: boolean;
}

// 模式颜色
const MODE_COLORS: Record<TimerMode, { primary: string; bright: string }> = {
  focus: { primary: '#7A918D', bright: '#8FA398' },
  break: { primary: '#C4A77D', bright: '#D4B896' },
  longBreak: { primary: '#6A6A6A', bright: '#7A7A7A' },
};

// 通信函数
const sendMessage = (message: { type: string; data?: unknown }): Promise<{ success: boolean; state?: TimerState; settings?: Settings }> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: unknown) => {
      resolve(response as { success: boolean; state?: TimerState; settings?: Settings });
    });
  });
};

function PopupApp() {
  const [timerState, setTimerState] = useState<TimerState>({
    mode: 'focus',
    timeLeft: 25 * 60,
    isRunning: false,
    pomodoroCycle: 0,
  });
  const [settings, setSettings] = useState<Settings>({
    customFocusTime: 25 * 60,
    customBreakTime: 5 * 60,
    customLongBreakTime: 30 * 60,
    autoSwitch: true,
    autoStart: true,
    soundEnabled: true,
    autoSkipNotification: false,
  });
  const [loading, setLoading] = useState(true);

  // 加载初始状态
  useEffect(() => {
    const loadState = async () => {
      try {
        const stateResponse = await sendMessage({ type: 'GET_STATE' }) as { success: boolean; state?: TimerState };
        const settingsResponse = await sendMessage({ type: 'GET_SETTINGS' }) as { success: boolean; settings?: Settings };

        if (stateResponse.success && stateResponse.state) {
          setTimerState(stateResponse.state);
        }
        if (settingsResponse.success && settingsResponse.settings) {
          setSettings(settingsResponse.settings);
        }
      } catch (e) {
        console.error('Failed to load state:', e);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, []);

  // setInterval 更新倒计时（仅视觉）
  useEffect(() => {
    let interval: number | undefined;

    if (timerState.isRunning) {
      interval = window.setInterval(async () => {
        // 每次从 storage 获取最新状态
        const response = await sendMessage({ type: 'GET_STATE' }) as { success: boolean; state?: TimerState };
        if (response.success && response.state) {
          setTimerState(response.state);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取模式标签
  const getModeLabel = () => {
    switch (timerState.mode) {
      case 'focus': return '专注时间';
      case 'break': return '短休息';
      case 'longBreak': return '长休息';
    }
  };

  // 获取当前模式时长
  const getTotalTime = () => {
    switch (timerState.mode) {
      case 'focus': return settings.customFocusTime;
      case 'break': return settings.customBreakTime;
      case 'longBreak': return settings.customLongBreakTime;
    }
  };

  // 开始/暂停
  const handleStartPause = async () => {
    const response = await sendMessage({
      type: timerState.isRunning ? 'PAUSE' : 'START',
      data: { timeLeft: timerState.timeLeft },
    }) as { success: boolean; state?: TimerState };

    if (response.success && response.state) {
      setTimerState(response.state);
    }
  };

  // 重置
  const handleReset = async () => {
    const response = await sendMessage({
      type: 'RESET',
      data: { mode: timerState.mode },
    }) as { success: boolean; state?: TimerState };

    if (response.success && response.state) {
      setTimerState(response.state);
    }
  };

  // 切换模式
  const handleModeChange = async (mode: TimerMode) => {
    if (mode === timerState.mode) return;

    const response = await sendMessage({
      type: 'SET_MODE',
      data: { mode },
    }) as { success: boolean; state?: TimerState };

    if (response.success && response.state) {
      setTimerState(response.state);
    }
  };

  // 打开设置页面
  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  // 计算进度
  const totalTime = getTotalTime();
  const progress = totalTime > 0 ? 1 - (timerState.timeLeft / totalTime) : 0;
  const circumference = 2 * Math.PI * 100;
  const offset = circumference * (1 - progress);

  if (loading) {
    return (
      <div style={{ width: 320, padding: 16, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <p>加载中...</p>
      </div>
    );
  }

  const themeColor = MODE_COLORS[timerState.mode];

  return (
    <div style={{ width: 340, padding: 16, fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif', background: '#F0ECE5', minHeight: 400, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
      {/* 标题 */}
      <h2 style={{ textAlign: 'center', margin: '0 0 16px 0', color: '#7A918D', fontWeight: 600 }}>PomoZen</h2>

      {/* 模式切换 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        {(['focus', 'break', 'longBreak'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 8,
              background: timerState.mode === m ? themeColor.primary : 'transparent',
              color: timerState.mode === m ? '#fff' : '#666',
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
          >
            {m === 'focus' ? '专注' : m === 'break' ? '短休息' : '长休息'}
          </button>
        ))}
      </div>

      {/* 计时器圆环 */}
      <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 16px' }}>
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(44,44,44,0.08)" strokeWidth="12" />
          <circle
            cx="110"
            cy="110"
            r="100"
            fill="none"
            stroke={themeColor.primary}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease', filter: `drop-shadow(0 0 8px ${themeColor.primary}40)` }}
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 'bold', color: '#2C2C2C' }}>{formatTime(timerState.timeLeft)}</div>
          <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{getModeLabel()}</div>
          {settings.autoSwitch && timerState.mode !== 'longBreak' && (
            <div style={{ color: themeColor.primary, fontSize: 12, marginTop: 8 }}>
              第 {timerState.pomodoroCycle}/4 轮
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button
          onClick={handleStartPause}
          style={{
            padding: '12px 32px',
            border: 'none',
            borderRadius: 12,
            background: themeColor.primary,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 500,
            boxShadow: `0 4px 12px ${themeColor.primary}40`,
          }}
        >
          {timerState.isRunning ? '暂停' : '开始'}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '12px 20px',
            border: `1px solid ${themeColor.primary}`,
            borderRadius: 12,
            background: 'transparent',
            color: themeColor.primary,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          重置
        </button>
        <button
          onClick={handleOpenSettings}
          style={{
            padding: '12px 20px',
            border: `1px solid ${themeColor.primary}`,
            borderRadius: 12,
            background: 'transparent',
            color: themeColor.primary,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          设置
        </button>
      </div>

      {/* 运行状态 */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 12,
          fontSize: 12,
          background: timerState.isRunning ? themeColor.primary : 'rgba(44,44,44,0.08)',
          color: timerState.isRunning ? '#fff' : '#666',
        }}>
          {timerState.isRunning ? '运行中' : '已停止'}
        </span>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<PopupApp />);