/**
 * 番茄钟计时器 Web Worker
 *
 * 在独立线程中运行计时逻辑，支持多个计时器并行运行，确保：
 * - 页面失去焦点时仍能准确计时
 * - 不受浏览器节流影响
 * - UI 更新更流畅
 * - 多个模式可以同时运行
 */

import type { WorkerCommand, WorkerMessage, WorkerState, TimerMode } from '../types/worker';

const states: Record<TimerMode, WorkerState> = {
  focus: { timeLeft: 0, isRunning: false },
  break: { timeLeft: 0, isRunning: false },
  longBreak: { timeLeft: 0, isRunning: false },
};

const intervalIds: Record<TimerMode, ReturnType<typeof setInterval> | null> = {
  focus: null,
  break: null,
  longBreak: null,
};

// 追踪每个模式的初始时间（用于计算实际完成的时长）
const initialTimes: Record<TimerMode, number> = {
  focus: 0,
  break: 0,
  longBreak: 0,
};

/**
 * 向主线程发送消息
 */
function postMessage(message: WorkerMessage): void {
  self.postMessage(message);
}

/**
 * 创建计时器间隔
 * @param mode 计时器模式
 * @param logCompletion 是否在完成时记录日志
 */
function createTimerInterval(mode: TimerMode, logCompletion: boolean = false): void {
  intervalIds[mode] = setInterval(() => {
    states[mode].timeLeft--;

    postMessage({
      type: 'UPDATE',
      mode,
      timeLeft: states[mode].timeLeft,
    });

    if (states[mode].timeLeft === 0) {
      if (logCompletion) {
        console.log(`Worker: Timer ${mode} completed`);
      }
      stopTimer(mode);
      // 发送完成的时长（初始时间 - 剩余时间 = 0）
      postMessage({ type: 'COMPLETE', mode, completedDuration: initialTimes[mode] });
    }
  }, 1000);
}

/**
 * 开始指定模式的计时
 */
function startTimer(mode: TimerMode, initialTime: number): void {
  states[mode].timeLeft = initialTime;
  states[mode].isRunning = true;
  initialTimes[mode] = initialTime; // 记录初始时间

  if (intervalIds[mode] !== null) {
    clearInterval(intervalIds[mode]);
  }

  createTimerInterval(mode, true);
}

/**
 * 暂停指定模式的计时
 */
function pauseTimer(mode: TimerMode): void {
  states[mode].isRunning = false;
  if (intervalIds[mode] !== null) {
    clearInterval(intervalIds[mode]);
    intervalIds[mode] = null;
  }
}

/**
 * 恢复指定模式的计时
 */
function resumeTimer(mode: TimerMode): void {
  if (states[mode].timeLeft > 0) {
    states[mode].isRunning = true;
    createTimerInterval(mode, false);
  }
}

/**
 * 停止指定模式的计时
 */
function stopTimer(mode: TimerMode): void {
  states[mode].isRunning = false;
  if (intervalIds[mode] !== null) {
    clearInterval(intervalIds[mode]);
    intervalIds[mode] = null;
  }
}

/**
 * 重置指定模式的计时器
 */
function resetTimer(mode: TimerMode, initialTime: number): void {
  stopTimer(mode);
  states[mode].timeLeft = initialTime;
}

/**
 * 设置指定模式的时间
 */
function setTimerTime(mode: TimerMode, time: number): void {
  states[mode].timeLeft = time;
  stopTimer(mode);
}

/**
 * 监听主线程消息
 */
self.onmessage = (e: MessageEvent<WorkerCommand>): void => {
  const command = e.data;

  switch (command.type) {
    case 'START':
      startTimer(command.mode, command.initialTime);
      break;

    case 'PAUSE':
      pauseTimer(command.mode);
      break;

    case 'RESUME':
      resumeTimer(command.mode);
      break;

    case 'RESET':
      resetTimer(command.mode, command.initialTime);
      break;

    case 'SET_TIME':
      setTimerTime(command.mode, command.time);
      break;

    default:
      const unknownCmd = command as { type: string };
      console.error(`[Worker Error] Unknown command: ${unknownCmd.type}`);
  }
};

/**
 * 导出 Worker 类型（用于 TypeScript）
 */
export type {};
