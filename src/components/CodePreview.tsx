
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CodePreviewProps {
  code: string;
  className?: string;
}

export function CodePreview({ code, className }: CodePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Generate a visual representation of the Jaclang code
        // This is a simplified visual representation since actual execution would require a backend
        const lines = code.split('\n');
        let html = '<div class="p-4">';
        
        // Create a visual representation of the code structure
        lines.forEach((line, index) => {
          const trimmedLine = line.trim();
          
          // Detect common code structures
          if (trimmedLine.startsWith('function') || trimmedLine.startsWith('def')) {
            html += `<div class="mb-2 p-2 bg-primary/10 rounded-md">${escapeHtml(line)}</div>`;
          } else if (trimmedLine.startsWith('class')) {
            html += `<div class="mb-2 p-2 bg-accent/20 rounded-md">${escapeHtml(line)}</div>`;
          } else if (trimmedLine.startsWith('if') || trimmedLine.startsWith('else') || trimmedLine.startsWith('for') || trimmedLine.startsWith('while')) {
            html += `<div class="mb-1 p-1 bg-secondary/20 rounded-md">${escapeHtml(line)}</div>`;
          } else if (trimmedLine.startsWith('return')) {
            html += `<div class="mb-1 text-primary">${escapeHtml(line)}</div>`;
          } else if (trimmedLine.startsWith('print') || trimmedLine.startsWith('println')) {
            html += `<div class="mb-1 text-green-500">${escapeHtml(line)}</div>`;
          } else if (trimmedLine.startsWith('import') || trimmedLine.startsWith('from')) {
            html += `<div class="mb-1 text-muted-foreground">${escapeHtml(line)}</div>`;
          } else if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
            html += `<div class="mb-1 text-muted-foreground/70 italic">${escapeHtml(line)}</div>`;
          } else if (trimmedLine === '') {
            html += '<div class="mb-1">&nbsp;</div>';
          } else {
            html += `<div class="mb-1">${escapeHtml(line)}</div>`;
          }
        });
        
        html += '</div>';
        setPreviewHtml(html);
      } catch (error) {
        setPreviewHtml('<div class="p-4 text-destructive">Error generating preview</div>');
      } finally {
        setIsLoading(false);
      }
    }, 300); // Short delay to simulate processing

    return () => clearTimeout(timer);
  }, [code]);

  // Simple HTML escaping function
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <div className={cn("w-full h-full overflow-auto bg-card", className)}>
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div 
          className="font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}
    </div>
  );
}
