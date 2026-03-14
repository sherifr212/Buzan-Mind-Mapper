// ExportPanel — Sprint 17
// Provides export/import UI accessible from the EditableCanvas toolbar.

import { useState, useRef } from 'react';
import type { MindMap } from '@bmm/data-model';
import { exportToSvg, exportToBmm, exportToDocx, exportToPdf, exportToOpml, getOutlineText } from './ExportService';
import { importBmmFile, type ComplianceViolation } from './ImportService';

interface ExportPanelProps {
  map: MindMap;
  onImport?: (map: MindMap) => void;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadText(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  downloadBlob(blob, filename);
}

export function ExportPanel({ map, onImport }: ExportPanelProps) {
  const [open, setOpen] = useState(false);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [importedMapTitle, setImportedMapTitle] = useState<string | null>(null);
  const [svgPreview, setSvgPreview] = useState<string | null>(null);
  const [outlinePreview, setOutlinePreview] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSvg = () => {
    const svg = exportToSvg(map);
    setSvgPreview(svg);
    downloadText(svg, `${map.title}.svg`, 'image/svg+xml');
  };

  const handlePdf = async () => {
    const svg = exportToSvg(map);
    const bytes = await exportToPdf(svg);
    downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${map.title}.pdf`);
  };

  const handleDocx = async () => {
    const outline = getOutlineText(map);
    setOutlinePreview(outline);
    const blob = await exportToDocx(map);
    downloadBlob(blob, `${map.title}.docx`);
  };

  const handleBmm = () => {
    const json = exportToBmm(map);
    downloadText(json, `${map.title}.bmm`, 'application/json');
  };

  const handleOpml = () => {
    const opml = exportToOpml(map);
    downloadText(opml, `${map.title}.opml`, 'application/xml');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        const { map: imported, violations: v } = importBmmFile(json);
        setViolations(v);
        setImportedMapTitle(imported.title);
        onImport?.(imported);
      } catch {
        setViolations([{ branchId: '', keyword: '', rule: 'PARSE', message: 'Failed to parse .bmm file.', fixHint: 'Ensure the file is valid .bmm JSON.' }]);
      }
    };
    reader.readAsText(file);
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: 12,
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    cursor: 'pointer',
    color: '#334155',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        data-testid="export-panel-toggle"
        onClick={() => setOpen((v) => !v)}
        style={{ ...btnStyle, background: '#1e293b', color: 'white', border: 'none' }}
      >
        Export / Import
      </button>

      {open && (
        <div
          data-testid="export-panel"
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: 16,
            zIndex: 1000,
            minWidth: 220,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <strong style={{ fontSize: 13, color: '#1e293b', marginBottom: 4 }}>Export</strong>
          <button data-testid="export-svg-btn" onClick={handleSvg} style={btnStyle}>
            SVG (vector)
          </button>
          <button data-testid="export-pdf-btn" onClick={handlePdf} style={btnStyle}>
            PDF (landscape)
          </button>
          <button data-testid="export-docx-btn" onClick={handleDocx} style={btnStyle}>
            Linear Outline (DOCX)
          </button>
          <button data-testid="export-bmm-btn" onClick={handleBmm} style={btnStyle}>
            .bmm (native format)
          </button>
          <button data-testid="export-opml-btn" onClick={handleOpml} style={btnStyle}>
            OPML
          </button>

          <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
          <strong style={{ fontSize: 13, color: '#1e293b' }}>Import</strong>
          <button
            data-testid="import-bmm-btn"
            onClick={() => fileInputRef.current?.click()}
            style={btnStyle}
          >
            Import .bmm file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".bmm,.json"
            style={{ display: 'none' }}
            onChange={handleImport}
            data-testid="import-file-input"
          />

          {importedMapTitle && (
            <p
              data-testid="import-success"
              style={{ fontSize: 12, color: '#16a34a', margin: 0 }}
            >
              Imported: {importedMapTitle}
            </p>
          )}

          {/* Compliance warnings panel */}
          {violations.length > 0 && (
            <div
              data-testid="compliance-warnings-panel"
              style={{
                marginTop: 8,
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: 8,
                padding: 10,
              }}
            >
              <strong style={{ fontSize: 12, color: '#92400e', display: 'block', marginBottom: 6 }}>
                Compliance Warnings ({violations.length})
              </strong>
              {violations.map((v, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <p
                    data-testid={`violation-${i}`}
                    style={{ fontSize: 11, color: '#78350f', margin: '0 0 2px' }}
                  >
                    {v.message}
                  </p>
                  <button
                    data-testid={`fix-btn-${i}`}
                    style={{
                      fontSize: 11,
                      color: '#1e293b',
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      borderRadius: 4,
                      padding: '2px 8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {/* open relevant enforcement tool */}}
                  >
                    Fix ({v.rule})
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SVG preview (for testing) */}
          {svgPreview && (
            <div
              data-testid="svg-preview"
              style={{ display: 'none' }}
              dangerouslySetInnerHTML={{ __html: svgPreview }}
            />
          )}

          {/* Outline preview (for testing) */}
          {outlinePreview && (
            <div
              data-testid="outline-preview"
              style={{ display: 'none' }}
            >
              {outlinePreview.join('\n')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
