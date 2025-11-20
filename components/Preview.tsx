import React, { useMemo } from 'react';

interface PreviewProps {
  code: string;
}

const Preview: React.FC<PreviewProps> = ({ code }) => {
  
  // Create a complete HTML document string for the iframe
  const srcDoc = useMemo(() => {
    // If the code looks like a full HTML document, use it directly.
    if (code.trim().toLowerCase().startsWith('<!doctype html') || code.trim().toLowerCase().startsWith('<html')) {
      return code;
    }

    // Otherwise, wrap it in a basic template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>body { font-family: sans-serif; padding: 1rem; color: #333; background: #fff; }</style>
        </head>
        <body>
          ${code}
        </body>
      </html>
    `;
  }, [code]);

  return (
    <div className="h-full w-full bg-white">
      <iframe
        title="Live Preview"
        srcDoc={srcDoc}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-modals" // Secure sandbox
      />
    </div>
  );
};

export default Preview;