import type { Meta, StoryObj } from '@storybook/react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import { CentralImageNode } from './CentralImageNode';
import type { ImageNode } from '@bmm/data-model';

// ─── CentralImageNode Stories ─────────────────────────────────────────────────
// AT-RE-020: Central Image remains at canvas centre at all zoom levels [VISUAL]
// AT-RE-023: All BOI branches connect to Central Image boundary [VISUAL]

const sampleImage: ImageNode = {
  id: 'ci-story',
  type: 'text-image',
  src: 'IDEAS',
  colors: ['#E53935', '#43A047', '#1E88E5'],
  hasDimension: true,
  position: { x: 0, y: 0 },
  size: { width: 140, height: 140 },
};

const nodeTypes = { centralImage: CentralImageNode };

function CentralImageStory({ image }: { image: ImageNode }) {
  return (
    <div style={{ width: 800, height: 600, background: '#f0f0f0' }}>
      <ReactFlow
        nodes={[
          {
            id: 'ci',
            type: 'centralImage',
            position: { x: 330, y: 230 },
            data: { image, canvasWidth: 800, canvasHeight: 600 },
          },
        ]}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

const meta: Meta<typeof CentralImageStory> = {
  title: 'Canvas/CentralImageNode',
  component: CentralImageStory,
  parameters: {
    chromatic: { viewports: [1280] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TextImage: Story = {
  args: { image: sampleImage },
};

export const RasterImage: Story = {
  args: {
    image: {
      ...sampleImage,
      type: 'raster',
      src: 'https://picsum.photos/seed/bmm/140/140',
      hasDimension: false,
    },
  },
};

export const WithoutDimension: Story = {
  args: {
    image: { ...sampleImage, hasDimension: false },
  },
};
