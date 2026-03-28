/**
 * Background Service Worker
 * 处理 chrome.alarms 计时和 chrome.notifications 通知
 */

// 存储键
const STORAGE_KEYS = {
  TIMER_STATE: 'tomato-timer-state',
  SETTINGS: 'tomato-settings',
};

// 默认设置
const DEFAULT_SETTINGS = {
  customFocusTime: 25 * 60,
  customBreakTime: 5 * 60,
  customLongBreakTime: 30 * 60,
  autoSwitch: true,
  autoStart: true,
  soundEnabled: true,
  autoSkipNotification: false,
};

// 获取设置
function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEYS.SETTINGS, (result) => {
      const settings = result[STORAGE_KEYS.SETTINGS];
      resolve(settings || DEFAULT_SETTINGS);
    });
  });
}

// 获取计时器状态
function getTimerState() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEYS.TIMER_STATE, (result) => {
      const state = result[STORAGE_KEYS.TIMER_STATE];
      resolve(state || {
        mode: 'focus',
        timeLeft: 25 * 60,
        isRunning: false,
        pomodoroCycle: 0,
      });
    });
  });
}

// 保存计时器状态
function saveTimerState(state) {
  chrome.storage.sync.set({ [STORAGE_KEYS.TIMER_STATE]: state });
}

// 发送通知
async function sendNotification(title, message) {
  const settings = await getSettings();

  // 使用 SVG 数据 URI 作为图标
  const iconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><text y="100" font-size="100">🍅</text></svg>';

  chrome.notifications.create('pomozen-timer', {
    type: 'basic',
    iconUrl: iconUrl,
    title: title,
    message: message,
    priority: 1,
  }, (notificationId) => {
    console.log('Notification created:', notificationId);
  });

  // 播放声音
  if (settings.soundEnabled) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 528; // 528Hz 治愈频率
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }
}

// 获取下一个模式
function getNextMode(currentMode, pomodoroCycle) {
  if (currentMode === 'focus') {
    return pomodoroCycle >= 4 ? 'longBreak' : 'break';
  }
  return 'focus';
}

// 获取模式时长
function getModeDuration(mode, settings) {
  switch (mode) {
    case 'focus': return settings.customFocusTime;
    case 'break': return settings.customBreakTime;
    case 'longBreak': return settings.customLongBreakTime;
  }
}

// 监听 alarm 事件
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'pomozen-timer') return;

  console.log('Timer alarm triggered');

  // 获取当前状态
  const state = await getTimerState();
  const settings = await getSettings();

  // 发送通知
  const notifications = {
    focus: { title: '专注结束', message: '时间到了！该休息一下了' },
    break: { title: '休息结束', message: '休息完成！开始专注吧' },
    longBreak: { title: '长休息结束', message: '休息完成！开始新的番茄钟周期' },
  };

  const notif = notifications[state.mode];
  if (notif) {
    await sendNotification(notif.title, notif.message);
  }

  // 如果自动切换
  if (settings.autoSwitch) {
    const nextMode = getNextMode(state.mode, state.pomodoroCycle);
    const nextDuration = getModeDuration(nextMode, settings);

    let newPomodoroCycle = state.pomodoroCycle;
    if (state.mode === 'focus') {
      newPomodoroCycle = nextMode === 'longBreak' ? 0 : state.pomodoroCycle;
    }

    const newState = {
      mode: nextMode,
      timeLeft: nextDuration,
      isRunning: settings.autoStart,
      pomodoroCycle: newPomodoroCycle,
      startTime: settings.autoStart ? Date.now() : undefined,
    };

    saveTimerState(newState);

    // 如果自动开始，设置新的 alarm
    if (settings.autoStart) {
      chrome.alarms.create('pomozen-timer', {
        delayInMinutes: Math.ceil(nextDuration / 60),
      });
    }
  } else {
    // 不自动切换，保持完成状态
    saveTimerState({ ...state, isRunning: false });
  }

  // 通知 popup 更新
  chrome.runtime.sendMessage({ type: 'TIMER_COMPLETE', mode: state.mode });
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Background received message:', message);

  (async () => {
    const { type, data } = message;

    switch (type) {
      case 'START': {
        const settings = await getSettings();
        let state = await getTimerState();

        const duration = getModeDuration(state.mode, settings);
        state = {
          ...state,
          isRunning: true,
          timeLeft: data?.timeLeft ?? state.timeLeft,
          startTime: Date.now(),
        };
        saveTimerState(state);

        // 设置 alarm（最小 1 分钟）
        const delayMinutes = Math.max(1, Math.ceil(state.timeLeft / 60));
        chrome.alarms.create('pomozen-timer', {
          delayInMinutes: delayMinutes,
        });

        sendResponse({ success: true, state });
        break;
      }

      case 'PAUSE': {
        let state = await getTimerState();

        // 计算已经过去的时间
        if (state.startTime) {
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
          state.timeLeft = Math.max(0, state.timeLeft - elapsed);
        }

        state = { ...state, isRunning: false, startTime: undefined };
        saveTimerState(state);
        chrome.alarms.clear('pomozen-timer');

        sendResponse({ success: true, state });
        break;
      }

      case 'RESET': {
        const settings = await getSettings();
        const duration = getModeDuration(data?.mode || 'focus', settings);

        const state = {
          mode: data?.mode || 'focus',
          timeLeft: duration,
          isRunning: false,
          pomodoroCycle: 0,
        };
        saveTimerState(state);
        chrome.alarms.clear('pomozen-timer');

        sendResponse({ success: true, state });
        break;
      }

      case 'SET_MODE': {
        const settings = await getSettings();
        const duration = getModeDuration(data.mode, settings);

        let state = await getTimerState();

        // 如果正在运行，先暂停
        if (state.isRunning && state.startTime) {
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
          state.timeLeft = Math.max(0, state.timeLeft - elapsed);
          saveTimerState({ ...state, isRunning: false });
        }

        chrome.alarms.clear('pomozen-timer');

        const newState = {
          mode: data.mode,
          timeLeft: duration,
          isRunning: false,
          pomodoroCycle: state.pomodoroCycle,
        };
        saveTimerState(newState);

        sendResponse({ success: true, state: newState });
        break;
      }

      case 'GET_STATE': {
        const state = await getTimerState();
        sendResponse({ success: true, state });
        break;
      }

      case 'GET_SETTINGS': {
        const settings = await getSettings();
        sendResponse({ success: true, settings });
        break;
      }

      case 'UPDATE_SETTINGS': {
        chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: data.settings });
        sendResponse({ success: true });
        break;
      }

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  })();

  return true; // 异步响应
});

// 初始化时检查是否有正在运行的计时器
chrome.alarms.get('pomozen-timer', (alarm) => {
  if (alarm) {
    console.log('Found existing alarm:', alarm);
  }
});

console.log('PomoZen background service worker initialized');