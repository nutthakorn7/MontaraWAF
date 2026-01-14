import type { Meta, StoryObj } from '@storybook/react';
import EmptyState from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['no-data', 'no-results', 'error', 'offline', 'no-access'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoData: Story = {
  args: {
    variant: 'no-data',
  },
};

export const NoResults: Story = {
  args: {
    variant: 'no-results',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
  },
};

export const Offline: Story = {
  args: {
    variant: 'offline',
  },
};

export const NoAccess: Story = {
  args: {
    variant: 'no-access',
  },
};

export const WithAction: Story = {
  args: {
    variant: 'no-data',
    title: 'No policies configured',
    description: 'Get started by creating your first WAF policy.',
    action: {
      label: 'Create Policy',
      onClick: () => alert('Create policy clicked!'),
    },
  },
};

export const CustomMessage: Story = {
  args: {
    variant: 'no-results',
    title: 'No matching events',
    description: 'Try adjusting your date range or search filters.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4" style={{ width: '800px' }}>
      <EmptyState variant="no-data" />
      <EmptyState variant="no-results" />
      <EmptyState variant="error" />
      <EmptyState variant="offline" />
      <EmptyState variant="no-access" />
    </div>
  ),
};
