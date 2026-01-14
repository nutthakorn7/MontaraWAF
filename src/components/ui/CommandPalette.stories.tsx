import type { Meta, StoryObj } from '@storybook/react';
import CommandPalette from './CommandPalette';

const meta: Meta<typeof CommandPalette> = {
  title: 'UI/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# CommandPalette

A keyboard-driven command palette for quick navigation throughout the application.

## Features
- **Global Hotkey**: Press \`Cmd+K\` (Mac) or \`Ctrl+K\` (Windows) to open
- **Search**: Filter through all available pages and actions
- **Keyboard Navigation**: Use ↑↓ arrows to navigate, Enter to select, Escape to close
- **Grouped Results**: Commands are organized by category (Security, Analytics, Network, Account)

## Usage

The CommandPalette component is rendered in the root layout and is available on all pages.

\`\`\`tsx
// In your layout.tsx
import CommandPalette from '@/components/ui/CommandPalette';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
\`\`\`

## Keyboard Shortcuts
| Key | Action |
|-----|--------|
| \`Cmd+K\` / \`Ctrl+K\` | Open/Close palette |
| \`↑\` / \`↓\` | Navigate items |
| \`Enter\` | Select item |
| \`Escape\` | Close palette |
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Command Palette Demo</h1>
        <p className="text-gray-400 mb-8">
          Press <kbd className="px-2 py-1 bg-gray-700 rounded">⌘K</kbd> or{' '}
          <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl+K</kbd> to open the command palette
        </p>
        <button 
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
          className="px-6 py-3 bg-imperva-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Open Command Palette
        </button>
      </div>
      <CommandPalette />
    </div>
  ),
};
