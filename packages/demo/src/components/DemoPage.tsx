import { useState } from 'react';
import { type DemoConfig, validateDemoCompleteness } from '../app/demoRegistry';
import { CodePanel } from './CodePanel';
import '../styles/DemoPage.css';

interface DemoPageProps {
  demo: DemoConfig;
}

type TabType = 'preview' | 'code' | 'notes';

export function DemoPage({ demo }: DemoPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const DemoComponent = demo.component;
  const completeness = validateDemoCompleteness(demo);

  return (
    <div className="demo-page">
      {/* Incompleteness Warning */}
      {!completeness.isComplete && (
        <div className="demo-warning">
          <div className="warning-icon">⚠</div>
          <div className="warning-content">
            <h3>Demo Incomplete</h3>
            <p>This demo is missing the following fields: <code>{completeness.missingFields.join(', ')}</code></p>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              Please add the missing content to <code>src/demos/{demo.id}/</code> to complete this demo.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="demo-header">
        <div className="demo-header-content">
          <h1 className="demo-title">{demo.title}</h1>
          <p className="demo-description">{demo.description}</p>
          {demo.tags && demo.tags.length > 0 && (
            <div className="demo-tags">
              {demo.tags.map((tag: string) => (
                <span key={tag} className="demo-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="demo-tabs">
        <button
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
        <button
          className={`tab-button ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          Code
        </button>
        <button
          className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="demo-content">
        {activeTab === 'preview' && (
          <div className="tab-pane preview-pane">
            <div className="preview-container">
              <DemoComponent />
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="tab-pane code-pane">
            {demo.code && demo.code.length > 0 ? (
              <CodePanel
                code={demo.code}
                language="typescript"
                filename={`${demo.slug}.tsx`}
              />
            ) : (
              <div className="code-placeholder">
                <p>Code snippet not available for this demo.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="tab-pane notes-pane">
            <div className="notes-content">
              <h2>{demo.title}</h2>
              <p className="demo-description">{demo.description}</p>

              {demo.learningOutcomes && demo.learningOutcomes.length > 0 && (
                <section className="learning-outcomes">
                  <h3>Learning Outcomes</h3>
                  <ul>
                    {demo.learningOutcomes.map((outcome, idx) => (
                      <li key={idx}>{outcome}</li>
                    ))}
                  </ul>
                </section>
              )}

              {demo.notes && demo.notes.length > 0 && (
                <section className="implementation-notes">
                  <h3>Implementation Notes</h3>
                  <pre className="notes-text">{demo.notes}</pre>
                </section>
              )}

              <footer className="notes-footer">
                <p>
                  Full source code available at: <code>src/demos/{demo.id}/Code.tsx</code>
                </p>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
