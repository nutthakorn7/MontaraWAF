import type { Meta, StoryObj } from '@storybook/react';
import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'John Doe',
  },
};

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
};

export const Small: Story = {
  args: {
    name: 'Jane Smith',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    name: 'Mike Johnson',
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Small" size="sm" />
      <Avatar name="Medium" size="md" />
      <Avatar name="Large" size="lg" />
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar name="User 1" className="ring-2 ring-white" />
      <Avatar name="User 2" className="ring-2 ring-white" />
      <Avatar name="User 3" className="ring-2 ring-white" />
      <Avatar name="+5" className="ring-2 ring-white" />
    </div>
  ),
};
