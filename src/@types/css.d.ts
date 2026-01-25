/**
 * CSS 模块类型声明
 *
 * 为所有 .css 文件提供 TypeScript 类型支持
 * 允许导入 CSS 文件并正确推断类名类型
 *
 * @example
 * import styles from './App.css';
 * const className: string = styles.myClass;
 */

declare module '*.css' {
  /**
   * CSS 模块内容
   * 键为 CSS 类名，值为 CSS 类名的字符串
   */
  const content: { [className: string]: string };
  export default content;
}
