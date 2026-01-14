import type { Meta, StoryObj } from '@storybook/react';
import ConfirmDialog from './ConfirmDialog';
import { useState } from 'react';
import { Trash2, AlertTriangle, LogOut } from 'lucide-react';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component for interactive stories
const ConfirmDialogDemo = (props: Partial<React.ComponentProps<typeof ConfirmDialog>>) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-imperva-blue text-white rounded-lg"
      >
        Open Dialog
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action?"
        loading={loading}
        {...props}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <ConfirmDialogDemo />,
};

export const Destructive: Story = {
  render: () => (
    <ConfirmDialogDemo
      title="Delete Rule"
      message="Are you sure you want to delete this rule? This action cannot be undone."
      confirmLabel="Delete Rule"
      cancelLabel="Cancel"
      variant="destructive"
    />
  ),
};

export const CustomIcon: Story = {
  render: () => (
    <ConfirmDialogDemo
      title="Sign Out"
      message="Are you sure you want to sign out of your account?"
      confirmLabel="Sign Out"
      cancelLabel="Stay Signed In"
      icon={<LogOut className="w-6 h-6 text-blue-500" />}
    />
  ),
};

export const WithLoading: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    return (
      <div>
        <button 
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Delete Item
        </button>
        <ConfirmDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setIsOpen(false);
            }, 2000);
          }}
          title="Delete Item"
          message="This will permanently delete the item."
          confirmLabel="Delete"
          variant="destructive"
          loading={loading}
        />
      </div>
    );
  },
};
