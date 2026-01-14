import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Pagination from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: () => {},
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    onPageChange: () => {},
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    onPageChange: () => {},
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
    onPageChange: () => {},
  },
};

const InteractivePagination = () => {
  const [page, setPage] = useState(1);
  return (
    <div className="space-y-4 text-center">
      <Pagination currentPage={page} totalPages={20} onPageChange={setPage} />
      <p className="text-sm text-gray-600">Current page: {page}</p>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractivePagination />,
};
