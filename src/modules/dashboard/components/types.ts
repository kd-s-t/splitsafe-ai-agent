export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  label?: string;
  icon?: React.ReactNode;
  additionalInfo?: string;
  isLoading?: boolean;
}
