import type { Meta, StoryObj } from '@storybook/react';
import DataTable from './DataTable';
import Badge from './Badge';

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'active' },
];

export const Default: Story = {
  args: {
    keyField: 'id',
    data: users,
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'role', header: 'Role' },
      { key: 'status', header: 'Status' },
    ],
  },
};

export const WithCustomRender: Story = {
  args: {
    keyField: 'id',
    data: users,
    columns: [
      { key: 'name', header: 'Name', render: (row) => <strong>{row.name}</strong> },
      { key: 'email', header: 'Email' },
      { key: 'role', header: 'Role', render: (row) => (
        <Badge variant={row.role === 'Admin' ? 'purple' : 'default'} size="sm">{row.role}</Badge>
      )},
      { key: 'status', header: 'Status', render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'} size="sm">{row.status}</Badge>
      )},
    ],
  },
};

export const Empty: Story = {
  args: {
    keyField: 'id',
    data: [],
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
    ],
    emptyMessage: 'No users found',
  },
};

export const Loading: Story = {
  args: {
    keyField: 'id',
    data: [],
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
    ],
    loading: true,
  },
};
