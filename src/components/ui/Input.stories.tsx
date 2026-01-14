import type { Meta, StoryObj } from '@storybook/react';
import Input from './Input';
import { Search, Mail, Lock } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    icon: <Search className="w-4 h-4" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    icon: <Lock className="w-4 h-4" />,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    value: 'Cannot edit',
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input label="Default" placeholder="Enter text..." />
      <Input label="With Icon" placeholder="Search..." icon={<Search className="w-4 h-4" />} />
      <Input label="With Error" value="bad input" error="This field is invalid" />
      <Input label="Disabled" value="Cannot edit" disabled />
    </div>
  ),
};
