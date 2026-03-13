import type { Meta, StoryObj } from '@storybook/react';
import { BuzanCanvas } from './BuzanCanvas';
import type { MindMap } from '@bmm/data-model';
import fixtureData from './fixtures/fixture-simple.bmm.json';

// ─── BuzanCanvas Stories ──────────────────────────────────────────────────────
// AT-RE-002: branches are curved Bézier paths [VISUAL]
// AT-RE-004: canvas orientation is always landscape [VISUAL]
// AT-RE-020: Central Image remains at canvas centre [VISUAL]
// AT-RE-023: all BOI branches connect to Central Image boundary [VISUAL]

// Cast the raw JSON fixture to MindMap (types match the schema)
const simpleFixture = fixtureData as unknown as MindMap;

const meta: Meta<typeof BuzanCanvas> = {
  title: 'Canvas/BuzanCanvas',
  component: BuzanCanvas,
  parameters: {
    chromatic: { viewports: [1920] },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** AT-RE-002 / AT-RE-004 / AT-RE-020 / AT-RE-023 — fixture-simple.bmm */
export const FixtureSimple: Story = {
  args: { map: simpleFixture },
  name: 'fixture-simple.bmm',
};

/** AT-RE-004: landscape canvas constraint verified (width > height) */
export const LandscapeOnly: Story = {
  args: {
    map: {
      ...simpleFixture,
      canvasSize: { width: 1920, height: 1080 },
    },
  },
  name: 'Landscape (1920×1080)',
};
