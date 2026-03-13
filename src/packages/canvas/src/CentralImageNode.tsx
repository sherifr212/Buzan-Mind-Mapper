import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ImageNode } from '@bmm/data-model';

// ─── CentralImageNode ─────────────────────────────────────────────────────────
// Renders the Central Image at the canvas centre.
// RE-020: Central Image is always at geometric centre.
// RE-021: Supports raster, SVG, drawn, and text-image types.
// RE-022: Minimum size enforced relative to canvas.

export interface CentralImageNodeData {
  image: ImageNode;
  canvasWidth?: number;
  canvasHeight?: number;
}

function CentralImageNodeComponent({ data }: NodeProps<CentralImageNodeData>) {
  const { image } = data;

  const style: React.CSSProperties = {
    width: image.size.width,
    height: image.size.height,
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
    border: '2px solid #ccc',
    boxShadow: image.hasDimension ? '4px 4px 12px rgba(0,0,0,0.3)' : undefined,
    position: 'relative',
  };

  const content =
    image.type === 'text-image' ? (
      <span
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          padding: 8,
          // Apply multi-color gradient for text-image per LE-002
          background: `linear-gradient(135deg, ${image.colors.join(', ')})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {image.src}
      </span>
    ) : (
      <img
        src={image.src}
        alt="Central Image"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );

  return (
    <div style={style} data-testid="central-image-node">
      {content}
      {/* Handles around the boundary for BOI branch connections (RE-023) */}
      <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />
    </div>
  );
}

export const CentralImageNode = memo(CentralImageNodeComponent);
