/**
 * Chrome Extension 类型声明
 */
declare const chrome: {
  runtime: {
    lastError?: {
      message: string;
    };
    openOptionsPage: () => Promise<void>;
    getURL: (path: string) => string;
    sendMessage: (message: unknown, responseCallback?: (response: unknown) => void) => void;
    onMessage: {
      addListener: (callback: (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => void) => void;
      removeListener: (callback: (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => void) => void;
    };
  };
  storage: {
    sync: {
      get: (keys: string | string[] | null, callback: (result: Record<string, unknown>) => void) => void;
      set: (items: Record<string, unknown>, callback?: () => void) => void;
      remove: (keys: string | string[], callback?: () => void) => void;
    };
    local: {
      get: (keys: string | string[] | null, callback: (result: Record<string, unknown>) => void) => void;
      set: (items: Record<string, unknown>, callback?: () => void) => void;
    };
  };
  alarms: {
    create: (name: string, alarmInfo?: { delayInMinutes?: number; periodInMinutes?: number }) => void;
    get: (name: string, callback: (alarm: { name: string; scheduledTime: number } | undefined) => void) => void;
    clear: (name: string, callback?: () => void) => void;
    onAlarm: {
      addListener: (callback: (alarm: { name: string; scheduledTime: number }) => void) => void;
    };
  };
  notifications: {
    create: (notificationId: string, options: { type: string; iconUrl?: string; title: string; message: string; priority?: number }, callback?: (notificationId: string) => void) => string;
    onClicked: {
      addListener: (callback: (notificationId: string) => void) => void;
    };
  };
};