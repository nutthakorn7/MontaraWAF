import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Tabs from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const defaultTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'settings', label: 'Settings' },
  { id: 'security', label: 'Security' },
];

export const Default: Story = {
  args: {
    tabs: defaultTabs,
    activeTab: 'overview',
    onTabChange: () => {},
  },
};

const InteractiveTabs = () => {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div>
      <Tabs tabs={defaultTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-4 p-4 border rounded">
        Content for: <strong>{activeTab}</strong>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveTabs />,
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: 'Dashboard' },
      { id: 'tab2', label: 'Analytics' },
      { id: 'tab3', label: 'Reports' },
      { id: 'tab4', label: 'Users' },
      { id: 'tab5', label: 'Settings' },
    ],
    activeTab: 'tab1',
    onTabChange: () => {},
  },
};

export const WithIcons: Story = {
  args: {
    tabs: [
      { id: 'home', label: '🏠 Home' },
      { id: 'users', label: '👥 Users' },
      { id: 'settings', label: '⚙️ Settings' },
    ],
    activeTab: 'home',
    onTabChange: () => {},
  },
};
