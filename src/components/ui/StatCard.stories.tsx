import type { Meta, StoryObj } from '@storybook/react';
import StatCard from './StatCard';
import { Shield, Users, Activity, AlertTriangle } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['blue', 'green', 'red', 'purple', 'orange'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: 'Total Requests',
    value: '1.2M',
    icon: Activity,
    color: 'blue',
  },
};

export const WithTrend: Story = {
  args: {
    title: 'Active Users',
    value: '1,234',
    icon: Users,
    color: 'green',
    trend: '+12.5%',
    trendUp: true,
  },
};

export const NegativeTrend: Story = {
  args: {
    title: 'Attacks Blocked',
    value: '567',
    icon: Shield,
    color: 'red',
    trend: '-5.2%',
    trendUp: false,
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Blue" value="100" icon={Activity} color="blue" />
      <StatCard title="Green" value="200" icon={Users} color="green" trend="+5%" trendUp />
      <StatCard title="Red" value="50" icon={AlertTriangle} color="red" trend="-3%" trendUp={false} />
      <StatCard title="Purple" value="75" icon={Shield} color="purple" />
      <StatCard title="Orange" value="125" icon={Activity} color="orange" />
    </div>
  ),
};
