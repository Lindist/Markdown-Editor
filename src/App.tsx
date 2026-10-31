import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from "react";

export default function App() {
  const [markdown, setMarkdown] = useState<string>(
    "# Welcome to Markdown Notes\n\nStart typing on the left to see live preview on the right!\n\n- **Drag** the center divider to resize.\n- **Double-click** the divider to reset to 50/50.\n- Use the toolbar buttons to **collapse / expand** views."
  );

  // Pane resizing & collapsing states
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage (0 - 100)
  const [collapsedState, setCollapsedState] = useState<"none" | "editor" | "preview">("none");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
          <span className="px-2 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-300">
            Phase 1: Resizable Split Pane
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
              className="hover:text-slate-200 p-0.5 rounded hover:bg-slate-700"
            >
              ◀ Collapse
            </button>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
            className="w-full flex-1 p-4 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-slate-200 placeholder-slate-500 overflow-y-auto"
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
              className="hover:text-slate-200 p-0.5 rounded hover:bg-slate-700"
            >
              Collapse ▶
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-slate-200">
            <pre className="font-mono text-sm whitespace-pre-wrap text-slate-300">
              {markdown}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}
