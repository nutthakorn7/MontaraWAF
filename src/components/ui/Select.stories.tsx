import type { Meta, StoryObj } from '@storybook/react';
import Select from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
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
type Story = StoryObj<typeof Select>;

const options = [
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

export const Default: Story = {
  args: {
    options,
    placeholder: 'Select an option',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Role',
    options,
    placeholder: 'Select role...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Role',
    options,
    value: 'editor',
  },
};

export const WithError: Story = {
  args: {
    label: 'Role',
    options,
    error: 'Please select a role',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Role',
    options,
    value: 'admin',
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <Select label="Default" options={options} placeholder="Select..." />
      <Select label="Selected" options={options} value="editor" />
      <Select label="With Error" options={options} error="Required field" />
      <Select label="Disabled" options={options} value="admin" disabled />
    </div>
  ),
};
