import { useState } from 'react';
import { DEMO_REGISTRY, getDemoCategories, validateDemoCompleteness, type DemoConfig } from './demoRegistry';
import { APP_VERSION } from './version';
import '../styles/AppShell.css';

interface AppShellProps {
  currentDemo: DemoConfig;
  onDemoSelect: (demo: DemoConfig) => void;
}

export function AppShell({ currentDemo, onDemoSelect }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const categories = getDemoCategories();

  return (
    <div className="app-shell">
      {/* Mobile toggle button */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">RowaKit Demo Gallery</h1>
          <p className="sidebar-subtitle">v{APP_VERSION} • Progressive Demos</p>
        </div>

        <nav className="sidebar-nav">
          {categories.map((category) => (
            <div key={category.id} className="nav-section">
              <h3 className="nav-section-title">
                {category.label}
                <span className="demo-count">{category.count}</span>
              </h3>
              <ul className="nav-list">
                {DEMO_REGISTRY.filter((d) => d.category === category.id).map(
                  (demo) => {
                    const completeness = validateDemoCompleteness(demo);
                    return (
                      <li key={demo.id}>
                        <button
                          className={`nav-link ${
                            currentDemo.id === demo.id ? 'active' : ''
                          } ${!completeness.isComplete ? 'incomplete' : ''}`}
                          onClick={() => {
                            onDemoSelect(demo);
                            setSidebarOpen(false); // Close sidebar on mobile
                          }}
                          title={demo.description}
                        >
                          <span className="nav-link-title">{demo.title}</span>
                          {!completeness.isComplete && (
                            <span
                              className="incomplete-badge"
                              title={`Missing: ${completeness.missingFields.join(', ')}`}
                            >
                              ⚠
                            </span>
                          )}
                          {demo.tags && demo.tags.length > 0 && (
                            <span className="nav-link-tags">
                              {demo.tags.slice(0, 1).map((tag) => (
                                <span
                                  key={tag}
                                  className="tag"
                                  title={demo.tags?.join(', ')}
                                >
                                  {tag}
                                </span>
                              ))}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  }
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">
            <a
              href="https://github.com/yourusername/rowakit"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            {' • '}
            <a
              href="https://rowakit.dev/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Docs
            </a>
          </p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <main className="main-content">{/* Content rendered via routes */}</main>
    </div>
  );
}
