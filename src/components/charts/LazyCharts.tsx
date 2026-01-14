'use client';

import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';

// Loading placeholder
const ChartLoading = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <RefreshCw className="w-6 h-6 animate-spin text-imperva-blue" />
  </div>
);

// Lazy load all Recharts components
export const LazyLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { loading: ChartLoading, ssr: false }
);

export const LazyAreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { loading: ChartLoading, ssr: false }
);

export const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { loading: ChartLoading, ssr: false }
);

export const LazyPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { loading: ChartLoading, ssr: false }
);

export const LazyResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

// Re-export non-component items (these are small and can be imported normally)
export { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Line,
  Area,
  Bar,
  Pie,
  Cell,
} from 'recharts';
