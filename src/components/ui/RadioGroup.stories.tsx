import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import RadioGroup from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

const options = [
  { value: 'block', label: 'Block' },
  { value: 'challenge', label: 'Challenge' },
  { value: 'allow', label: 'Allow' },
];

export const Default: Story = {
  args: {
    name: 'action',
    options,
    value: 'block',
    onChange: () => {},
  },
};

export const Horizontal: Story = {
  args: {
    name: 'action',
    options,
    value: 'challenge',
    onChange: () => {},
    orientation: 'horizontal',
  },
};

const InteractiveDemo = () => {
  const [value, setValue] = useState('block');
  return (
    <div className="space-y-4">
      <RadioGroup
        name="demo"
        options={options}
        value={value}
        onChange={setValue}
      />
      <p className="text-sm text-gray-600">Selected: {value}</p>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

export const WithLabel: Story = {
  args: {
    name: 'severity',
    label: 'Severity Level',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
    value: 'medium',
    onChange: () => {},
  },
};
