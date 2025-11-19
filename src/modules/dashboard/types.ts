import { ActivityItem, NormalizedTransaction } from '../shared.types';

export interface RecentActivitiesProps {
  transactions?: NormalizedTransaction[];
}

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  additionalInfo?: string;
  isLoading?: boolean;
}

export interface DashboardStatsProps {
  transactions: NormalizedTransaction[];
}

export interface ActivityContentProps {
  idx: number;
  activity: ActivityItem;
  category: string;
  txUrl?: string;
  principal?: string;
}
