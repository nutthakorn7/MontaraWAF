import type { Meta, StoryObj } from '@storybook/react';
import Tooltip from './Tooltip';
import Button from './Button';
import { Info, HelpCircle } from 'lucide-react';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
};

export const Top: Story = {
  args: {
    content: 'Top tooltip',
    position: 'top',
    children: <Button variant="secondary">Top</Button>,
  },
};

export const Bottom: Story = {
  args: {
    content: 'Bottom tooltip',
    position: 'bottom',
    children: <Button variant="secondary">Bottom</Button>,
  },
};

export const Left: Story = {
  args: {
    content: 'Left tooltip',
    position: 'left',
    children: <Button variant="secondary">Left</Button>,
  },
};

export const Right: Story = {
  args: {
    content: 'Right tooltip',
    position: 'right',
    children: <Button variant="secondary">Right</Button>,
  },
};

export const WithIcon: Story = {
  args: {
    content: 'Click for more information',
    children: <HelpCircle className="w-5 h-5 text-gray-400 cursor-help" />,
  },
};

export const AllPositions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 p-8">
      <Tooltip content="Top" position="top">
        <Button variant="ghost">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom" position="bottom">
        <Button variant="ghost">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left" position="left">
        <Button variant="ghost">Left</Button>
      </Tooltip>
      <Tooltip content="Right" position="right">
        <Button variant="ghost">Right</Button>
      </Tooltip>
    </div>
  ),
};
