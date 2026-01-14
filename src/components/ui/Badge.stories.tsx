import type { Meta, StoryObj } from '@storybook/react';
import Badge, { StatusBadge, SeverityBadge } from './Badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info', 'purple'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
  },
};

export const Success: Story = {
  args: {
    children: 'Active',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Pending',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Blocked',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

export const Purple: Story = {
  args: {
    children: 'AI-Powered',
    variant: 'purple',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Verified',
    variant: 'success',
    icon: <CheckCircle className="w-3 h-3" />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">default</Badge>
      <Badge variant="success">success</Badge>
      <Badge variant="warning">warning</Badge>
      <Badge variant="error">error</Badge>
      <Badge variant="info">info</Badge>
      <Badge variant="purple">purple</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge enabled={true} />
      <StatusBadge enabled={false} />
    </div>
  ),
};

export const SeverityBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <SeverityBadge severity="critical" />
      <SeverityBadge severity="high" />
      <SeverityBadge severity="medium" />
      <SeverityBadge severity="low" />
    </div>
  ),
};
