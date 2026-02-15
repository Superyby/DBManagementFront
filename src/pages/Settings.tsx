import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../hooks/useTheme';

export function Settings() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="container-fluid" style={{ maxWidth: '800px' }}>
      <div className="shadow-box big-padding">
        <h2 className="mb-4">设置</h2>

        {/* 外观设置 */}
        <section className="mb-4">
          <h5 className="settings-subheading">外观</h5>
          
          <div className="mt-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="darkModeSwitch"
                checked={isDark}
                onChange={toggleTheme}
              />
              <label className="form-check-label" htmlFor="darkModeSwitch">
                <FontAwesomeIcon icon={isDark ? faMoon : faSun} className="me-2" />
                深色模式
              </label>
            </div>
            <small className="text-muted d-block mt-1">
              切换深色/浅色主题，设置会自动保存
            </small>
          </div>
        </section>

        {/* 关于 */}
        <section className="mb-4">
          <h5 className="settings-subheading">关于</h5>
          
          <div className="mt-3">
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td className="text-muted" style={{ width: '150px' }}>应用名称</td>
                  <td><strong>DB Manager</strong></td>
                </tr>
                <tr>
                  <td className="text-muted">版本</td>
                  <td>0.1.0</td>
                </tr>
                <tr>
                  <td className="text-muted">技术栈</td>
                  <td>React + TypeScript + Bootstrap</td>
                </tr>
                <tr>
                  <td className="text-muted">后端</td>
                  <td>Rust + Axum 微服务架构</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 帮助信息 */}
        <section>
          <div className="alert alert-info">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            <strong>提示：</strong>
            这是一个数据库管理工具，支持连接和管理多种类型的数据库。
            如需帮助，请查阅项目文档。
          </div>
        </section>
      </div>
    </div>
  );
}
