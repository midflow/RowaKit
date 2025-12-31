import React, { useState } from 'react';
import BasicUsageDemo from './examples/BasicUsageDemo';
import MockServerDemo from './examples/MockServerDemo';
import CustomColumnsDemo from './examples/CustomColumnsDemo';
import StylingDemo from './examples/StylingDemo';

type ExampleType = 'basic' | 'mock' | 'custom' | 'styling';

export default function App() {
  const [activeExample, setActiveExample] = useState<ExampleType>('basic');

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>RowaKit Table - Examples</h1>
        <p>Interactive demonstrations of RowaKit Table features</p>
      </div>

      <div className="demo-nav">
        <button
          className={activeExample === 'basic' ? 'active' : ''}
          onClick={() => setActiveExample('basic')}
        >
          Basic Usage
        </button>
        <button
          className={activeExample === 'mock' ? 'active' : ''}
          onClick={() => setActiveExample('mock')}
        >
          Mock Server
        </button>
        <button
          className={activeExample === 'custom' ? 'active' : ''}
          onClick={() => setActiveExample('custom')}
        >
          Custom Columns
        </button>
        <button
          className={activeExample === 'styling' ? 'active' : ''}
          onClick={() => setActiveExample('styling')}
        >
          Styling
        </button>
      </div>

      <div className="example-section">
        {activeExample === 'basic' && <BasicUsageDemo />}
        {activeExample === 'mock' && <MockServerDemo />}
        {activeExample === 'custom' && <CustomColumnsDemo />}
        {activeExample === 'styling' && <StylingDemo />}
      </div>
    </div>
  );
}
