import type { Meta, StoryObj } from '@storybook/react';
import Toggle from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    enabled: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    label: 'Enable Feature',
    enabled: false,
    onToggle: () => {},
  },
};

export const Enabled: Story = {
  args: {
    label: 'JavaScript Challenge',
    enabled: true,
    onToggle: () => {},
  },
};

export const WithDescription: Story = {
  args: {
    label: 'CAPTCHA',
    description: 'Require visitors to complete a CAPTCHA challenge',
    enabled: true,
    onToggle: () => {},
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Toggle',
    enabled: false,
    disabled: true,
    onToggle: () => {},
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Toggle 
        label="Enabled" 
        enabled={true} 
        onToggle={() => {}} 
      />
      <Toggle 
        label="Disabled" 
        enabled={false} 
        onToggle={() => {}} 
      />
      <Toggle 
        label="With Description" 
        description="This is a helpful description"
        enabled={true} 
        onToggle={() => {}} 
      />
    </div>
  ),
};
