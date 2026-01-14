import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Dropdown from './Dropdown';
import Button from './Button';
import { MoreVertical, Edit, Trash2, Copy, Download } from 'lucide-react';

const meta: Meta<typeof Dropdown> = {
  title: 'UI/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const items = [
  { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => console.log('Edit') },
  { label: 'Copy', icon: <Copy className="w-4 h-4" />, onClick: () => console.log('Copy') },
  { label: 'Download', icon: <Download className="w-4 h-4" />, onClick: () => console.log('Download') },
  { type: 'divider' as const },
  { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => console.log('Delete'), danger: true },
];

export const Default: Story = {
  args: {
    trigger: <Button variant="ghost" icon={<MoreVertical className="w-4 h-4" />} />,
    items,
  },
};

export const WithText: Story = {
  args: {
    trigger: <Button variant="secondary">Actions</Button>,
    items,
  },
};

export const SimpleItems: Story = {
  args: {
    trigger: <Button variant="ghost" icon={<MoreVertical className="w-4 h-4" />} />,
    items: [
      { label: 'Option 1', onClick: () => {} },
      { label: 'Option 2', onClick: () => {} },
      { label: 'Option 3', onClick: () => {} },
    ],
  },
};
