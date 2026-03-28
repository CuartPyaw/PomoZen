/**
 * Settings 入口组件
 * 完整的设置页面，包含统计数据
 */
import { createRoot } from 'react-dom/client';
import App from '../App';

const SettingsApp = () => {
  return <App />;
};

const root = createRoot(document.getElementById('root')!);
root.render(<SettingsApp />);