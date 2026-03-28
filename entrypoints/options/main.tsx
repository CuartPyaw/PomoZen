/**
 * Settings 入口组件
 * 设置页面，包含统计数据和设置功能，不包含计时器
 */
import { createRoot } from 'react-dom/client';
import SettingsPage from '../SettingsPage';

const SettingsApp = () => {
  return <SettingsPage />;
};

const root = createRoot(document.getElementById('root')!);
root.render(<SettingsApp />);