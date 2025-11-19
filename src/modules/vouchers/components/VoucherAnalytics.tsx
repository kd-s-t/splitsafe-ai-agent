'use client';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Voucher } from '@/lib/internal/icp/vouchers';
import { Calendar, DollarSign, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { useVoucherFormatting } from '../hooks';

interface VoucherAnalyticsProps {
  vouchers: Voucher[];
  isLoading?: boolean;
}

interface ChartData {
  name: string;
  value: number;
  amount?: number;
  [key: string]: string | number | undefined;
}

interface MonthlyData {
  month: string;
  redeemed: number;
  claimed: number;
}

const COLORS = ['#00E19C', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'];

export default function VoucherAnalytics({ vouchers, isLoading = false }: VoucherAnalyticsProps) {
  const { formatAmount, getVoucherStatus } = useVoucherFormatting();

  // Process analytics data
  const analyticsData = useMemo(() => {
    if (!vouchers || vouchers.length === 0) {
      return {
        statusDistribution: [],
        monthlyRedemptions: [],
        totalRedeemed: 0,
        totalClaimed: 0,
        monthlyClaimed: 0,
        redemptionRate: 0,
        averageVoucherValue: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Status distribution
    const statusCounts = vouchers.reduce((acc, voucher) => {
      const status = getVoucherStatus(voucher);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution: ChartData[] = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));

    // Monthly redemption data (last 6 months)
    const monthlyData: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthVouchers = vouchers.filter(voucher => {
        const voucherDate = new Date(Number(voucher.createdAt) / 1000000);
        return voucherDate.getMonth() === date.getMonth() && 
               voucherDate.getFullYear() === date.getFullYear();
      });

      const redeemedThisMonth = monthVouchers.filter(voucher => 
        Number(voucher.redeemAt) > 0
      ).length;

      const claimedThisMonth = monthVouchers
        .filter(voucher => Number(voucher.redeemAt) > 0)
        .reduce((sum, voucher) => sum + Number(voucher.amount), 0);

      monthlyData.push({
        month: monthName,
        redeemed: redeemedThisMonth,
        claimed: claimedThisMonth / 100000000 // Convert satoshis to BTC
      });
    }

    // Calculate totals
    const redeemedVouchers = vouchers.filter(voucher => Number(voucher.redeemAt) > 0);
    const totalRedeemed = redeemedVouchers.length;
    const totalClaimed = redeemedVouchers.reduce((sum, voucher) => sum + Number(voucher.amount), 0);
    
    // Current month claimed amount
    const currentMonthVouchers = vouchers.filter(voucher => {
      const voucherDate = new Date(Number(voucher.createdAt) / 1000000);
      return voucherDate.getMonth() === currentMonth && 
             voucherDate.getFullYear() === currentYear &&
             Number(voucher.redeemAt) > 0;
    });
    const monthlyClaimed = currentMonthVouchers.reduce((sum, voucher) => sum + Number(voucher.amount), 0);

    // Redemption rate
    const redemptionRate = vouchers.length > 0 ? (totalRedeemed / vouchers.length) * 100 : 0;

    // Average voucher value
    const averageVoucherValue = vouchers.length > 0 
      ? vouchers.reduce((sum, voucher) => sum + Number(voucher.amount), 0) / vouchers.length 
      : 0;

    return {
      statusDistribution,
      monthlyRedemptions: monthlyData,
      totalRedeemed,
      totalClaimed,
      monthlyClaimed,
      redemptionRate,
      averageVoucherValue
    };
  }, [vouchers, getVoucherStatus]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-[#222222] border-[#303434] text-white p-6 rounded-[20px]">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-600 rounded mb-4"></div>
            <div className="h-64 bg-gray-600 rounded"></div>
          </div>
        </Card>
        <Card className="bg-[#222222] border-[#303434] text-white p-6 rounded-[20px]">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-600 rounded mb-4"></div>
            <div className="h-64 bg-gray-600 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!vouchers || vouchers.length === 0) {
    return (
      <Card className="bg-[#222222] border-[#303434] text-white p-6 rounded-[20px] mb-8">
        <div className="text-center py-8">
          <PieChartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <Typography variant="h3" className="text-gray-400 mb-2">
            No Analytics Available
          </Typography>
          <Typography variant="muted" className="text-gray-500">
            Create your first voucher to see analytics and insights
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#222222] border-[#303434] text-white p-4 rounded-[20px]">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="muted" className="text-[#BBBBBB] text-sm mb-1">
                Total Redeemed
              </Typography>
              <Typography variant="h3" className="text-2xl font-semibold text-white">
                {analyticsData.totalRedeemed}
              </Typography>
            </div>
            <div className="bg-[#323232] rounded-full p-2">
              <TrendingUp className="text-green-400 text-xl" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#222222] border-[#303434] text-white p-4 rounded-[20px]">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="muted" className="text-[#BBBBBB] text-sm mb-1">
                This Month Claimed
              </Typography>
              <Typography variant="h3" className="text-2xl font-semibold text-white">
                {formatAmount(BigInt(analyticsData.monthlyClaimed))} BTC
              </Typography>
            </div>
            <div className="bg-[#323232] rounded-full p-2">
              <DollarSign className="text-blue-400 text-xl" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#222222] border-[#303434] text-white p-4 rounded-[20px]">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="muted" className="text-[#BBBBBB] text-sm mb-1">
                Redemption Rate
              </Typography>
              <Typography variant="h3" className="text-2xl font-semibold text-white">
                {analyticsData.redemptionRate.toFixed(1)}%
              </Typography>
            </div>
            <div className="bg-[#323232] rounded-full p-2">
              <PieChartIcon className="text-purple-400 text-xl" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#222222] border-[#303434] text-white p-4 rounded-[20px]">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="muted" className="text-[#BBBBBB] text-sm mb-1">
                Avg Voucher Value
              </Typography>
              <Typography variant="h3" className="text-2xl font-semibold text-white">
                {formatAmount(BigInt(analyticsData.averageVoucherValue))} BTC
              </Typography>
            </div>
            <div className="bg-[#323232] rounded-full p-2">
              <Calendar className="text-yellow-400 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Redemptions Chart */}
        <Card className="bg-[#222222] border-[#303434] text-white p-6 rounded-[20px]">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h3" className="text-white font-semibold">
              Monthly Redemptions
            </Typography>
            <TrendingUp className="text-green-400 text-xl" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.monthlyRedemptions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'redeemed' ? value : `${value.toFixed(8)} BTC`,
                    name === 'redeemed' ? 'Redeemed' : 'Amount Claimed'
                  ]}
                />
                <Bar dataKey="redeemed" fill="#00E19C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution Chart */}
        <Card className="bg-[#222222] border-[#303434] text-white p-6 rounded-[20px]">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h3" className="text-white font-semibold">
              Voucher Status
            </Typography>
            <PieChartIcon className="text-purple-400 text-xl" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Monthly Claimed Amount Trend */}
      <Card className="bg-[#222222] border-[#303434] text-white p-6 rounded-[20px]">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h3" className="text-white font-semibold">
            Monthly Claimed Amount Trend
          </Typography>
          <DollarSign className="text-blue-400 text-xl" />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.monthlyRedemptions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(4)}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [`${value.toFixed(8)} BTC`, 'Amount Claimed']}
              />
              <Line 
                type="monotone" 
                dataKey="claimed" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
