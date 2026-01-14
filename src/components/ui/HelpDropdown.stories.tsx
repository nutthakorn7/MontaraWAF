import type { Meta, StoryObj } from '@storybook/react';
import HelpDropdown from './HelpDropdown';

const meta: Meta<typeof HelpDropdown> = {
  title: 'UI/HelpDropdown',
  component: HelpDropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[400px] flex items-start justify-end p-8 bg-gray-900">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HelpDropdown>;

export const Default: Story = {};

export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div className="w-full">
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <span className="text-white font-semibold">Montara WAF</span>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Documentation</span>
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
};
