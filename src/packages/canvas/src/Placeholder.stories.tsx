import type { Meta, StoryObj } from '@storybook/react';

// Placeholder story for Sprint 0 baseline
const Placeholder = () => <div style={{ padding: '1rem' }}>BMM Canvas — Sprint 0 Baseline</div>;

const meta: Meta<typeof Placeholder> = {
  title: 'Canvas/Placeholder',
  component: Placeholder,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
