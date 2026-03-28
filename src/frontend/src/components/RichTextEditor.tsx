import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useRef, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const quillModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["blockquote", "link"],
      ["clean"],
    ],
  },
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "align",
  "indent",
  "blockquote",
  "link",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 200,
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  function insertTable() {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection(true);
    const idx = range?.index ?? quill.getLength();

    const headers = Array.from(
      { length: tableCols },
      (_, i) => `Header ${i + 1}`,
    );
    const bodyRows = Array.from({ length: tableRows }, (_, r) =>
      Array.from({ length: tableCols }, (_, c) => `Row ${r + 1}, Col ${c + 1}`),
    );

    const headerHtml = headers
      .map(
        (h) =>
          `<th style="border:1px solid #ccc;padding:6px 10px;background:#f0f0f0;font-weight:bold">${h}</th>`,
      )
      .join("");
    const bodyHtml = bodyRows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td style="border:1px solid #ccc;padding:6px 10px">${cell}</td>`).join("")}</tr>`,
      )
      .join("");
    const tableHtml = `<table style="border-collapse:collapse;width:100%;margin:8px 0"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table><p><br></p>`;

    quill.clipboard.dangerouslyPasteHTML(idx, tableHtml);
    setShowTableDialog(false);
    setTableRows(3);
    setTableCols(3);
  }

  return (
    <div className="rich-text-editor-wrapper" style={{ position: "relative" }}>
      <style>{`
        .ql-toolbar { background: #111; border-color: rgba(255,255,255,0.1) !important; border-radius: 12px 12px 0 0; }
        .ql-toolbar .ql-stroke { stroke: #aaa !important; }
        .ql-toolbar .ql-fill { fill: #aaa !important; }
        .ql-toolbar button:hover .ql-stroke, .ql-toolbar button.ql-active .ql-stroke { stroke: #00f5a0 !important; }
        .ql-toolbar button:hover .ql-fill, .ql-toolbar button.ql-active .ql-fill { fill: #00f5a0 !important; }
        .ql-toolbar .ql-picker-label { color: #aaa !important; }
        .ql-toolbar .ql-picker-label:hover { color: #00f5a0 !important; }
        .ql-toolbar .ql-picker-options { background: #1a1a1a !important; border-color: rgba(255,255,255,0.1) !important; }
        .ql-toolbar .ql-picker-item { color: #aaa !important; }
        .ql-toolbar .ql-picker-item:hover { color: #00f5a0 !important; }
        .ql-container { background: #1a1a1a; border-color: rgba(255,255,255,0.1) !important; border-radius: 0 0 12px 12px; min-height: ${minHeight}px; }
        .ql-editor { color: #fff; font-size: 14px; min-height: ${minHeight}px; line-height: 1.7; }
        .ql-editor.ql-blank::before { color: #666; font-style: normal; }
        .ql-editor table { border-collapse: collapse; width: 100%; margin: 8px 0; }
        .ql-editor table td, .ql-editor table th { border: 1px solid rgba(255,255,255,0.2); padding: 6px 10px; }
        .ql-editor table th { background: rgba(0,245,160,0.1); font-weight: bold; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { color: #fff; }
        .ql-editor a { color: #00f5a0; }
        .ql-editor blockquote { border-left: 4px solid #00f5a0; color: #aaa; padding-left: 12px; margin: 8px 0; }
        .ql-snow .ql-tooltip { background: #1a1a1a !important; border-color: rgba(255,255,255,0.1) !important; color: #fff !important; }
        .ql-snow .ql-tooltip input[type=text] { background: #111 !important; border-color: rgba(255,255,255,0.2) !important; color: #fff !important; }
      `}</style>

      <div style={{ marginBottom: 4 }}>
        <button
          type="button"
          onClick={() => setShowTableDialog(true)}
          style={{
            background: "rgba(0,245,160,0.1)",
            border: "1px solid rgba(0,245,160,0.3)",
            color: "#00f5a0",
            borderRadius: "8px",
            padding: "4px 12px",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ⊞ Insert Table
        </button>
      </div>

      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder ?? "Write document content here..."}
        theme="snow"
      />

      {showTableDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "24px",
              minWidth: "280px",
            }}
          >
            <h3
              style={{
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              Insert Table
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    color: "#aaa",
                    fontSize: "11px",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Rows
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "8px 12px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <span
                  style={{
                    color: "#aaa",
                    fontSize: "11px",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Columns
                </span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "8px 12px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowTableDialog(false)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "#aaa",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertTable}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#00f5a0",
                  color: "#000",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
