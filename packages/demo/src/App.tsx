import { useState, useEffect } from 'react';
import { AppShell } from './app/AppShell';
import { DemoPage } from './components/DemoPage';
import { getFirstDemo, getDemoBySlug, type DemoConfig } from './app/demoRegistry';

/**
 * Main App Component
 * Handles routing via URL hash and integrates AppShell + DemoPage
 */
export default function App() {
  // Initialize from URL hash, defaulting to first demo
  const [currentDemo, setCurrentDemo] = useState<DemoConfig>(() => {
    const hash = window.location.hash.slice(1) || 'basic-usage';
    const demo = getDemoBySlug(hash);
    return demo || getFirstDemo();
  });

  /**
   * Sync with URL on hash changes
   */
  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash.slice(1);
      
      if (hash) {
        const demo = getDemoBySlug(hash);
        if (demo) {
          setCurrentDemo(demo);
        }
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  /**
   * Handle demo selection and update URL
   */
  const handleDemoSelect = (demo: DemoConfig) => {
    // Only update the hash - the hashchange listener will update state
    window.location.hash = demo.slug;
  };

  return (
    <div className="app">
      <AppShell currentDemo={currentDemo} onDemoSelect={handleDemoSelect} />
      <div className="app-main">
        <DemoPage demo={currentDemo} />
      </div>
    </div>
  );
}
