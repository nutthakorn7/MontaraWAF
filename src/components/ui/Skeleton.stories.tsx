import type { Meta, StoryObj } from '@storybook/react';
import Skeleton from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = {
  args: {
    variant: 'text',
    width: 200,
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 48,
    height: 48,
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: 200,
    height: 100,
  },
};

export const CardSkeleton: Story = {
  render: () => (
    <div className="w-64 p-4 border rounded-lg space-y-3">
      <Skeleton variant="rectangular" height={120} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    </div>
  ),
};

export const TableSkeleton: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4 items-center p-2 border-b">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={60} />
        </div>
      ))}
    </div>
  ),
};
