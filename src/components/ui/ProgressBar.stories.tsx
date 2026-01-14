import type { Meta, StoryObj } from '@storybook/react';
import ProgressBar from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    color: {
      control: 'select',
      options: ['blue', 'green', 'red', 'yellow', 'purple'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 60,
  },
};

export const WithLabel: Story = {
  args: {
    value: 75,
    label: 'Progress',
    showValue: true,
  },
};

export const Colors: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <ProgressBar value={80} color="blue" label="Blue" />
      <ProgressBar value={60} color="green" label="Green" />
      <ProgressBar value={40} color="red" label="Red" />
      <ProgressBar value={90} color="yellow" label="Yellow" />
      <ProgressBar value={50} color="purple" label="Purple" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <ProgressBar value={70} size="sm" label="Small" />
      <ProgressBar value={70} size="md" label="Medium" />
      <ProgressBar value={70} size="lg" label="Large" />
    </div>
  ),
};

export const Complete: Story = {
  args: {
    value: 100,
    color: 'green',
    label: 'Complete',
    showValue: true,
  },
};
