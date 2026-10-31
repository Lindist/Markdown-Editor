import { useState, useRef, useEffect, useMemo, MouseEvent as ReactMouseEvent } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure marked options
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true,    // GitHub Flavored Markdown (tables, task lists, etc.)
});

const INITIAL_MARKDOWN = `# 📝 Markdown Live Preview

Welcome to your **Tauri + React** Markdown Note-taking App!

## 🚀 Features
- **Fast & Responsive:** Powered by Vite, React, and Tauri (Rust)
- **Live Preview:** Instant parsing with \`marked\`
- **Safe & Secure:** Sanitized with \`DOMPurify\` to block malicious XSS
- **Split Screen:** Draggable divider & collapsible panes

---

## 💻 Code Example
\`\`\`typescript
const greeting = "Hello, Tauri Developer!";
console.log(greeting);
\`\`\`

## 📋 Task List
- [x] Phase 1: Project Initialization & Basic Layout
- [x] Phase 1.5: Resizable & Collapsible Split Panes
- [x] Phase 2: Core Frontend Logic (Live Preview)
- [ ] Phase 3: Operating System Integration (Open / Save)
- [ ] Phase 4: Enhancements (Keyboard shortcuts & Synced scroll)

## 📊 Sample Table
| Technology | Role |
| :--- | :--- |
| **Tauri v2** | Desktop Runtime & OS Integration |
| **Rust** | High-performance Native Backend |
| **React 19** | Dynamic User Interface |
| **TailwindCSS** | Clean Modern Styling |

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra
`;

export default function App() {
  const [markdown, setMarkdown] = useState<string>(INITIAL_MARKDOWN);

  // Pane resizing & collapsing states
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage (0 - 100)
  const [collapsedState, setCollapsedState] = useState<"none" | "editor" | "preview">("none");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parse Markdown to Sanitized HTML in Real-Time
  const parsedHtml = useMemo(() => {
    try {
      const rawHtml = marked.parse(markdown) as string;
      return DOMPurify.sanitize(rawHtml);
    } catch (err) {
      console.error("Markdown parsing error:", err);
      return `<p class="text-rose-400">Error rendering markdown.</p>`;
    }
  }, [markdown]);

  // Handle Dragging
  const handleMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentPos = e.clientX - rect.left;
      const percentage = (currentPos / rect.width) * 100;

      // Snapping to collapse if dragged close to the edges
      if (percentage < 10) {
        setCollapsedState("editor");
      } else if (percentage > 90) {
        setCollapsedState("preview");
      } else {
        setCollapsedState("none");
        setSplitRatio(Math.min(Math.max(percentage, 15), 85));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Reset to 50/50
  const resetSplit = () => {
    setSplitRatio(50);
    setCollapsedState("none");
  };

  // Toggle Collapse
  const toggleCollapse = (target: "editor" | "preview") => {
    if (collapsedState === target) {
      setCollapsedState("none");
    } else {
      setCollapsedState(target);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen bg-slate-900 text-slate-100 font-sans ${
        isDragging ? "select-none cursor-col-resize" : ""
      }`}
    >
      {/* Top Bar with Layout Controls */}
      <header className="h-11 bg-slate-800 border-b border-slate-700 flex items-center px-4 justify-between text-xs text-slate-400 z-10">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200 text-sm">Markdown Notes</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[10px] font-medium">
            Phase 2: Live Preview
          </span>
        </div>

        {/* View Mode Controls (Collapse / Expand / Split) */}
        <div className="flex items-center bg-slate-900/80 rounded-lg p-0.5 border border-slate-700/70">
          <button
            onClick={() => toggleCollapse("preview")}
            title="Editor Only (Collapse Preview)"
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              collapsedState === "preview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Editor Only
          </button>
          <button
            onClick={resetSplit}
            title="Split View (Double click divider to reset)"
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              collapsedState === "none"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Split 50:50
          </button>
          <button
            onClick={() => toggleCollapse("editor")}
            title="Preview Only (Collapse Editor)"
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              collapsedState === "editor"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Preview Only
          </button>
        </div>
      </header>

      {/* Main Split-screen Container */}
      <main ref={containerRef} className="relative flex flex-1 overflow-hidden">
        {/* Left Pane: Editor */}
        <section
          style={{
            width:
              collapsedState === "editor"
                ? "0%"
                : collapsedState === "preview"
                ? "100%"
                : `${splitRatio}%`,
          }}
          className={`h-full flex flex-col bg-slate-900 border-r border-slate-800 overflow-hidden ${
            !isDragging ? "transition-[width] duration-150 ease-out" : ""
          } ${collapsedState === "editor" ? "hidden" : ""}`}
        >
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/60 text-xs font-medium text-slate-400 border-b border-slate-700/50">
            <span className="tracking-wide uppercase text-[11px]">Markdown Editor</span>
            <button
              onClick={() => toggleCollapse("editor")}
              title="Collapse Editor"
              className="hover:text-slate-200 p-0.5 rounded hover:bg-slate-700 transition-colors"
            >
              ◀ Collapse
            </button>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
            className="w-full flex-1 p-5 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-slate-200 placeholder-slate-500 overflow-y-auto"
            spellCheck={false}
          />
        </section>

        {/* Resizable Divider Bar */}
        {collapsedState === "none" && (
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={resetSplit}
            title="Drag to resize, double-click to reset 50/50"
            className={`group relative w-1.5 hover:w-2 bg-slate-800 hover:bg-indigo-500 active:bg-indigo-600 cursor-col-resize flex items-center justify-center transition-all select-none z-20 ${
              isDragging ? "bg-indigo-500 w-2" : ""
            }`}
          >
            {/* Visual Grip Indicator */}
            <div className="w-0.5 h-6 rounded-full bg-slate-600 group-hover:bg-white/80" />

            {/* Quick Collapse Buttons (Hovering over divider) */}
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-slate-800 border border-slate-600 rounded p-0.5 shadow-lg pointer-events-auto">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => toggleCollapse("editor")}
                title="Collapse Editor"
                className="w-5 h-5 flex items-center justify-center text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 rounded"
              >
                ◀
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => toggleCollapse("preview")}
                title="Collapse Preview"
                className="w-5 h-5 flex items-center justify-center text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 rounded"
              >
                ▶
              </button>
            </div>
          </div>
        )}

        {/* Collapsed Expand Quick Buttons */}
        {collapsedState === "editor" && (
          <button
            onClick={() => setCollapsedState("none")}
            title="Expand Editor"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-1.5 py-4 rounded-r border border-l-0 border-slate-700 shadow-lg text-xs z-30 transition-colors"
          >
            ▶
          </button>
        )}
        {collapsedState === "preview" && (
          <button
            onClick={() => setCollapsedState("none")}
            title="Expand Preview"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-1.5 py-4 rounded-l border border-r-0 border-slate-700 shadow-lg text-xs z-30 transition-colors"
          >
            ◀
          </button>
        )}

        {/* Right Pane: Preview */}
        <section
          style={{
            width:
              collapsedState === "preview"
                ? "0%"
                : collapsedState === "editor"
                ? "100%"
                : `${100 - splitRatio}%`,
          }}
          className={`h-full flex flex-col bg-slate-950 overflow-hidden ${
            !isDragging ? "transition-[width] duration-150 ease-out" : ""
          } ${collapsedState === "preview" ? "hidden" : ""}`}
        >
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/60 text-xs font-medium text-slate-400 border-b border-slate-700/50">
            <span className="tracking-wide uppercase text-[11px]">Live Preview</span>
            <button
              onClick={() => toggleCollapse("preview")}
              title="Collapse Preview"
              className="hover:text-slate-200 p-0.5 rounded hover:bg-slate-700 transition-colors"
            >
              Collapse ▶
            </button>
          </div>
          {/* Live Sanitized HTML Preview */}
          <div
            className="markdown-preview flex-1 p-6 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
          />
        </section>
      </main>
    </div>
  );
}
