/**
 * 音频播放工具
 *
 * 使用 Web Audio API 生成禅意提示音，无需外部音频文件
 */

/**
 * 播放通知提示音
 *
 * 生成清脆的禅意提示音（类似钵声效果）：
 * - 频率：528Hz（禅意频率）
 * - 持续时间：1.5秒
 * - 音量曲线：从 0.3 渐弱到 0.01
 *
 * @returns Promise<void> 播放完成的 Promise
 */
export const playNotificationSound = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      // 创建 AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        resolve();
        return;
      }

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // 连接节点：oscillator -> gain -> destination
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 配置振荡器
      oscillator.type = 'sine'; // 正弦波，声音更柔和
      oscillator.frequency.setValueAtTime(528, audioContext.currentTime); // 528Hz 禅意频率

      // 配置音量包络（ADSR 中的 Decay）
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

      // 播放
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);

      // 清理
      oscillator.onended = () => {
        audioContext.close();
        resolve();
      };
    } catch (error) {
      console.error('Error playing notification sound:', error);
      resolve();
    }
  });
};

/**
 * 播放短促的测试提示音
 *
 * 用于设置面板的通知预览功能
 * 比完成提示音更短促，适合快速测试
 *
 * @returns Promise<void> 播放完成的 Promise
 */
export const playTestSound = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        resolve();
        return;
      }

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 测试音：短促的提示音
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 音高

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      oscillator.onended = () => {
        audioContext.close();
        resolve();
      };
    } catch (error) {
      console.error('Error playing test sound:', error);
      resolve();
    }
  });
};
