/**
 * PomoZen 错误类型定义
 *
 * 提供统一的错误处理机制，包括基础错误类和特定场景错误类
 * @module types/errors
 */

/**
 * PomoZen 基础错误类
 * 所有自定义错误的基类
 */
export class PomoZenError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: unknown
  ) {
    super(message);
    this.name = 'PomoZenError';
  }
}

/**
 * localStorage 操作错误
 * 当 localStorage 读写失败时抛出
 */
export class StorageError extends PomoZenError {
  constructor(
    public readonly operation: 'read' | 'write' | 'delete',
    public readonly key: string,
    originalError?: Error
  ) {
    super(
      `Storage ${operation} failed for key "${key}"`,
      'STORAGE_ERROR',
      { originalError: originalError?.message }
    );
    this.name = 'StorageError';
  }
}

/**
 * Worker 通信错误
 * 当与 Web Worker 通信失败时抛出
 */
export class WorkerError extends PomoZenError {
  constructor(message: string, public readonly command?: string) {
    super(message, 'WORKER_ERROR', { command });
    this.name = 'WorkerError';
  }
}

/**
 * 验证错误
 * 当输入验证失败时抛出
 */
export class ValidationError extends PomoZenError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}
