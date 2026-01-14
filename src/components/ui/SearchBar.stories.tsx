import type { Meta, StoryObj } from '@storybook/react';
import SearchBar from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'UI/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[500px] w-[600px] p-8 bg-gray-900 flex items-start justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {};

export const InNavbar: Story = {
  decorators: [
    (Story) => (
      <div className="w-full">
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <span className="text-white font-semibold">Montara WAF</span>
          <div className="flex items-center gap-4">
            <Story />
            <span className="text-gray-400">? Help</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Click the search button or press ⌘K to open the search modal
        </p>
      </div>
    ),
  ],
};
