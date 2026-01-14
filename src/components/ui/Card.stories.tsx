import type { Meta, StoryObj } from '@storybook/react';
import Card, { CardHeader, CardTitle } from './Card';
import { Shield, Users, Activity } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    hover: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="font-semibold">Card Title</h3>
        <p className="text-gray-600 text-sm mt-2">Card content goes here.</p>
      </div>
    ),
  },
};

export const WithHeader: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Security Overview</CardTitle>
      </CardHeader>
      <div className="p-4">
        <p className="text-gray-600 text-sm">Your security score is excellent.</p>
      </div>
    </Card>
  ),
};

export const WithHover: Story = {
  args: {
    hover: true,
    className: 'w-64',
    children: (
      <div className="text-center">
        <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <h4 className="font-medium">Secure</h4>
        <p className="text-sm text-gray-500">All systems protected</p>
      </div>
    ),
  },
};

export const StatCards: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card className="text-center">
        <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
        <p className="text-2xl font-bold">99.9%</p>
        <p className="text-sm text-gray-500">Uptime</p>
      </Card>
      <Card className="text-center">
        <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
        <p className="text-2xl font-bold">1,234</p>
        <p className="text-sm text-gray-500">Users</p>
      </Card>
      <Card className="text-center">
        <Activity className="w-6 h-6 text-purple-500 mx-auto mb-2" />
        <p className="text-2xl font-bold">567K</p>
        <p className="text-sm text-gray-500">Requests</p>
      </Card>
    </div>
  ),
};
