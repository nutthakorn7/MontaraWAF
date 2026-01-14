import type { Meta, StoryObj } from '@storybook/react';
import SortableTable, { Column } from './SortableTable';

interface SampleData {
  id: number;
  name: string;
  status: string;
  requests: number;
  lastActive: string;
}

const sampleData: SampleData[] = [
  { id: 1, name: 'Production API', status: 'active', requests: 15420, lastActive: '2 min ago' },
  { id: 2, name: 'Staging Server', status: 'active', requests: 3210, lastActive: '5 min ago' },
  { id: 3, name: 'Dev Environment', status: 'inactive', requests: 890, lastActive: '1 hour ago' },
  { id: 4, name: 'Test Instance', status: 'warning', requests: 4500, lastActive: '15 min ago' },
  { id: 5, name: 'Backup Server', status: 'active', requests: 120, lastActive: '3 hours ago' },
];

const columns: Column<SampleData>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { 
    key: 'status', 
    label: 'Status', 
    sortable: true,
    render: (value) => {
      const colors: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        warning: 'bg-yellow-100 text-yellow-800',
      };
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${colors[value as string] || ''}`}>
          {value as string}
        </span>
      );
    }
  },
  { key: 'requests', label: 'Requests', sortable: true },
  { key: 'lastActive', label: 'Last Active', sortable: false },
];

const meta: Meta<typeof SortableTable<SampleData>> = {
  title: 'UI/SortableTable',
  component: SortableTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SortableTable<SampleData>>;

export const Default: Story = {
  args: {
    data: sampleData,
    columns: columns,
  },
};

export const WithRowClick: Story = {
  args: {
    data: sampleData,
    columns: columns,
    onRowClick: (row) => alert(`Clicked: ${row.name}`),
  },
};

export const EmptyTable: Story = {
  args: {
    data: [],
    columns: columns,
    emptyMessage: 'No servers found. Add a new server to get started.',
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    data: [],
    columns: columns,
    emptyMessage: 'No matching results. Try adjusting your filters.',
  },
};
