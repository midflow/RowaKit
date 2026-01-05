import { useState } from 'react';
import '../styles/CopyButton.css';

interface CopyButtonProps {
  text: string;
  label?: string;
}

/**
 * Copy-to-clipboard button with visual feedback
 */
export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      className="copy-button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label="Copy code"
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}
