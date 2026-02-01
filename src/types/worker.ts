/**
 * Web Worker 消息类型定义
 */

/**
 * 计时器模式类型
 */
export type TimerMode = 'focus' | 'break' | 'longBreak';

/**
 * 主线程发送给 Worker 的消息类型
 */
export type WorkerCommand =
  | { type: 'START'; mode: TimerMode; initialTime: number }
  | { type: 'PAUSE'; mode: TimerMode }
  | { type: 'RESUME'; mode: TimerMode }
  | { type: 'RESET'; mode: TimerMode; initialTime: number }
  | { type: 'SET_TIME'; mode: TimerMode; time: number };

/**
 * Worker 发送给主线程的消息类型
 */
export type WorkerMessage =
  | { type: 'UPDATE'; mode: TimerMode; timeLeft: number }
  | { type: 'COMPLETE'; mode: TimerMode };

/**
 * Worker 内部状态类型
 */
export interface WorkerState {
  timeLeft: number;
  isRunning: boolean;
}
