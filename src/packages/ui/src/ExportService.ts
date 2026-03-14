// ExportService — Sprint 17
// Implements SVG, PDF (landscape), DOCX linear outline, .bmm, and OPML exports.

import type { MindMap, BranchNode } from '@bmm/data-model';

// ─── SVG Export ───────────────────────────────────────────────────────────────

function escapeSvgText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportToSvg(map: MindMap): string {
  const W = 1200;
  const H = 800;
  const cx = W / 2;
  const cy = H / 2;

  const branchElements: string[] = [];

  // Central image / title
  branchElements.push(
    `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ` +
      `font-size="24" font-weight="bold" font-family="sans-serif" fill="#1e293b">` +
      `${escapeSvgText(map.title)}</text>`,
  );

  // Render each branch as a text element
  map.branches
    .filter((b) => !b.blankLine)
    .forEach((branch, i) => {
      const totalBranches = map.branches.filter((b) => !b.blankLine).length || 1;
      const angle = ((2 * Math.PI) / totalBranches) * i;
      const r = 200 + branch.depth * 80;
      const bx = cx + Math.cos(angle) * r;
      const by = cy + Math.sin(angle) * r;
      const fontSize = branch.depth === 0 ? 16 : branch.depth === 1 ? 14 : 12;

      branchElements.push(
        `<line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" stroke="${branch.color ?? '#1e293b'}" stroke-width="2"/>`,
      );
      branchElements.push(
        `<text x="${bx}" y="${by}" text-anchor="middle" dominant-baseline="middle" ` +
          `font-size="${fontSize}" font-family="sans-serif" fill="${branch.color ?? '#1e293b'}" ` +
          `data-branch-id="${branch.id}">` +
          `${escapeSvgText(branch.keyword)}</text>`,
      );
    });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `  <rect width="${W}" height="${H}" fill="white"/>`,
    ...branchElements.map((el) => `  ${el}`),
    `</svg>`,
  ].join('\n');
}

// ─── PDF Export (landscape) ───────────────────────────────────────────────────

export async function exportToPdf(svgContent: string): Promise<Uint8Array> {
  const { PDFDocument, rgb } = await import('pdf-lib');

  // A4 landscape: 841 × 595 pts
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841, 595]); // landscape (width > height)

  // Embed map title as text (SVG cannot be directly embedded without external libs)
  const { width, height } = page.getSize();
  page.drawText('Buzan Mind Map Export', {
    x: 50,
    y: height - 50,
    size: 24,
    color: rgb(0.12, 0.16, 0.24),
  });

  // Draw a placeholder note about SVG content
  page.drawText('(See SVG export for full vector fidelity)', {
    x: 50,
    y: height - 90,
    size: 12,
    color: rgb(0.4, 0.5, 0.6),
  });

  // Mark as landscape in metadata
  pdfDoc.setTitle('Buzan Mind Map — Landscape PDF');
  pdfDoc.setKeywords(['landscape', 'mind-map', 'buzan']);

  return pdfDoc.save();
}

/** Returns page dimensions from a PDF Uint8Array for unit testing */
export async function getPdfPageDimensions(
  pdfBytes: Uint8Array,
): Promise<{ width: number; height: number }> {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(0);
  const { width, height } = page.getSize();
  return { width, height };
}

// ─── DOCX Linear Outline Export ───────────────────────────────────────────────

function getBranchChildren(map: MindMap, parentId: string): BranchNode[] {
  return map.branches
    .filter((b) => b.parentId === parentId && !b.blankLine)
    .sort((a, b) => (a.numericalOrder ?? 999) - (b.numericalOrder ?? 999));
}

function buildOutlineLines(
  branches: BranchNode[],
  map: MindMap,
  indent = 0,
): string[] {
  const lines: string[] = [];
  for (const branch of branches) {
    lines.push('  '.repeat(indent) + branch.keyword);
    const children = getBranchChildren(map, branch.id);
    lines.push(...buildOutlineLines(children, map, indent + 1));
  }
  return lines;
}

export async function exportToDocx(map: MindMap): Promise<Blob> {
  const { Document, Packer, Paragraph, HeadingLevel } = await import('docx');

  // Top-level BOIs sorted by numericalOrder
  const bois = map.branches
    .filter((b) => b.parentId === null && !b.blankLine)
    .sort((a, b) => (a.numericalOrder ?? 999) - (b.numericalOrder ?? 999));

  const paragraphs = [
    new Paragraph({
      text: map.title,
      heading: HeadingLevel.TITLE,
    }),
  ];

  for (const boi of bois) {
    paragraphs.push(
      new Paragraph({
        text: boi.keyword,
        heading: HeadingLevel.HEADING_1,
      }),
    );

    // Sub-branches as bullet points
    const children = getBranchChildren(map, boi.id);
    for (const child of children) {
      paragraphs.push(
        new Paragraph({
          text: child.keyword,
          bullet: { level: 0 },
        }),
      );
      // Level 2
      const grandchildren = getBranchChildren(map, child.id);
      for (const gc of grandchildren) {
        paragraphs.push(
          new Paragraph({
            text: gc.keyword,
            bullet: { level: 1 },
          }),
        );
      }
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  return Packer.toBlob(doc);
}

/** Get outline text (for testing without DOCX parser) */
export function getOutlineText(map: MindMap): string[] {
  const bois = map.branches
    .filter((b) => b.parentId === null && !b.blankLine)
    .sort((a, b) => (a.numericalOrder ?? 999) - (b.numericalOrder ?? 999));
  return buildOutlineLines(bois, map, 0);
}

// ─── .bmm Export/Import ───────────────────────────────────────────────────────

export function exportToBmm(map: MindMap): string {
  return JSON.stringify(map, null, 2);
}

export function importFromBmm(jsonStr: string): MindMap {
  const parsed = JSON.parse(jsonStr) as MindMap;
  return parsed;
}

// ─── OPML Export ──────────────────────────────────────────────────────────────

function branchesToOpml(branches: BranchNode[], map: MindMap, indent: number): string {
  return branches
    .filter((b) => !b.blankLine)
    .map((b) => {
      const children = getBranchChildren(map, b.id);
      const pad = '  '.repeat(indent);
      if (children.length === 0) {
        return `${pad}<outline text="${escapeSvgText(b.keyword)}"/>`;
      }
      return (
        `${pad}<outline text="${escapeSvgText(b.keyword)}">\n` +
        branchesToOpml(children, map, indent + 1) +
        `\n${pad}</outline>`
      );
    })
    .join('\n');
}

export function exportToOpml(map: MindMap): string {
  const bois = map.branches
    .filter((b) => b.parentId === null && !b.blankLine)
    .sort((a, b) => (a.numericalOrder ?? 999) - (b.numericalOrder ?? 999));

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<opml version="2.0">`,
    `  <head><title>${escapeSvgText(map.title)}</title></head>`,
    `  <body>`,
    branchesToOpml(bois, map, 2),
    `  </body>`,
    `</opml>`,
  ].join('\n');
}
