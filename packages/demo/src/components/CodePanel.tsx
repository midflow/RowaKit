import { useEffect, useRef } from 'react';
import { CopyButton } from './CopyButton';
import '../styles/CodePanel.css';

interface CodePanelProps {
  code: string;
  language?: string;
  filename?: string;
}

/**
 * Code viewer with syntax highlighting and copy button
 * Uses Prism.js for highlighting (lazy-loaded from CDN)
 */
export function CodePanel({
  code,
  language = 'typescript',
  filename,
}: CodePanelProps) {
  const codeRef = useRef<HTMLElement>(null);

  /**
   * Apply Prism syntax highlighting when code changes
   */
  useEffect(() => {
    // Load Prism script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).Prism) {
      const script = document.createElement('script');
      script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
      script.async = true;
      script.onload = () => {
        // Load additional language plugin
        const langScript = document.createElement('script');
        langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${language}.min.js`;
        langScript.async = true;
        langScript.onload = () => {
          if ((window as any).Prism && codeRef.current) {
            (window as any).Prism.highlightElement(codeRef.current);
          }
        };
        document.head.appendChild(langScript);
      };
      document.head.appendChild(script);

      // Load CSS if not already loaded
      if (!document.querySelector('link[href*="prism"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href =
          'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
        document.head.appendChild(link);
      }
    } else if ((window as any).Prism && codeRef.current) {
      // Prism already loaded, just highlight
      (window as any).Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div className="code-panel">
      {filename && <div className="code-filename">{filename}</div>}
      <div className="code-toolbar">
        <span className="code-language">{language}</span>
        <CopyButton text={code} label="Copy Code" />
      </div>
      <pre className="code-pre">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
