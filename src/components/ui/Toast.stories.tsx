import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

// Note: Toast uses a Context provider, so we'll create a demo component
const ToastDemo = () => {
  const [toasts, setToasts] = useState<Array<{id: string; type: string; title: string; message?: string}>>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const bgColors: Record<string, string> = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  };

  return (
    <div className="p-8">
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => addToast('success', 'Success!', 'Your changes have been saved.')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Show Success
        </button>
        <button
          onClick={() => addToast('error', 'Error', 'Something went wrong.')}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Show Error
        </button>
        <button
          onClick={() => addToast('warning', 'Warning', 'Please review before proceeding.')}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          Show Warning
        </button>
        <button
          onClick={() => addToast('info', 'Info', 'New updates are available.')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Show Info
        </button>
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bgColors[toast.type]}`}
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{toast.title}</p>
              {toast.message && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'UI/Toast',
  component: ToastDemo,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Interactive: Story = {
  render: () => <ToastDemo />,
};

export const SuccessToast: Story = {
  render: () => (
    <div className="p-4">
      <div className="flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 max-w-sm">
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">Success!</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Your changes have been saved.</p>
        </div>
      </div>
    </div>
  ),
};

export const ErrorToast: Story = {
  render: () => (
    <div className="p-4">
      <div className="flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 max-w-sm">
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">Error</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Something went wrong.</p>
        </div>
      </div>
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="p-4 flex flex-col gap-2 max-w-sm">
      <div className="flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-green-50 border-green-200">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Success</p>
          <p className="text-sm text-gray-600 mt-1">Operation completed successfully.</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-red-50 border-red-200">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Error</p>
          <p className="text-sm text-gray-600 mt-1">Something went wrong.</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-yellow-50 border-yellow-200">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Warning</p>
          <p className="text-sm text-gray-600 mt-1">Please review before proceeding.</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-blue-50 border-blue-200">
        <div className="flex-1">
          <p className="font-medium text-gray-900">Info</p>
          <p className="text-sm text-gray-600 mt-1">New updates available.</p>
        </div>
      </div>
    </div>
  ),
};
