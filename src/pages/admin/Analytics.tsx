import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  Activity,
  Globe,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

const Analytics: React.FC = () => {
  const {
    analyticsData,
    isLoading,
    refreshAnalytics,
    exportReport,
    getCustomReport
  } = useAnalytics();

  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState(['users', 'trips', 'revenue']);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    refreshAnalytics(timeRange);
  }, [timeRange]);

  const handleRefresh = () => {
    refreshAnalytics(timeRange);
    setLastRefresh(new Date());
  };

  const handleExport = () => {
    exportReport(timeRange, selectedMetrics);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 ml-3">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into platform performance and user behavior
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={analyticsData?.totalUsers || 0}
          change={analyticsData?.userGrowth || 0}
          icon={Users}
          color="blue"
          trend={analyticsData?.userTrend || []}
        />
        <MetricCard
          title="Active Trips"
          value={analyticsData?.activeTrips || 0}
          change={analyticsData?.tripGrowth || 0}
          icon={MapPin}
          color="green"
          trend={analyticsData?.tripTrend || []}
        />
        <MetricCard
          title="Revenue"
          value={`$${(analyticsData?.revenue || 0).toLocaleString()}`}
          change={analyticsData?.revenueGrowth || 0}
          icon={DollarSign}
          color="purple"
          trend={analyticsData?.revenueTrend || []}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${(analyticsData?.engagementRate || 0).toFixed(1)}%`}
          change={analyticsData?.engagementChange || 0}
          icon={Activity}
          color="orange"
          trend={analyticsData?.engagementTrend || []}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">User growth chart would be rendered here</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Sources</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analyticsData?.revenueBreakdown?.map((source: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">{source.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${source.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {source.percentage}%
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No revenue data available</p>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analyticsData?.topCountries?.map((country: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-sm font-medium text-gray-900">{country.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {country.users.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {country.percentage}%
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No geographic data available</p>
            )}
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Engagement</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Active Users</span>
              <span className="text-lg font-semibold text-gray-900">
                {(analyticsData?.dailyActiveUsers || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Session Duration</span>
              <span className="text-lg font-semibold text-gray-900">
                {analyticsData?.avgSessionDuration || '0m'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pages per Session</span>
              <span className="text-lg font-semibold text-gray-900">
                {(analyticsData?.pagesPerSession || 0).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bounce Rate</span>
              <span className="text-lg font-semibold text-gray-900">
                {(analyticsData?.bounceRate || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Destinations */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Popular Destinations</h3>
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analyticsData?.topDestinations?.map((destination: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{destination.name}</span>
                </div>
                <span className="text-sm text-gray-600">{destination.trips} trips</span>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No destination data available</p>
            )}
          </div>
        </div>

        {/* Feature Usage */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Feature Usage</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analyticsData?.featureUsage?.map((feature: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                  <span className="text-sm text-gray-600">{feature.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${feature.usage}%` }}
                  />
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No feature usage data available</p>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <Zap className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Page Load Time</span>
              <span className="text-lg font-semibold text-gray-900">
                {(analyticsData?.pageLoadTime || 0).toFixed(2)}s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-lg font-semibold text-gray-900">
                {(analyticsData?.apiResponseTime || 0)}ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-lg font-semibold text-gray-900">
                {(analyticsData?.errorRate || 0).toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-lg font-semibold text-green-600">
                {(analyticsData?.uptime || 99.9).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend: number[];
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendingUp className={`h-4 w-4 ${change < 0 ? 'rotate-180' : ''}`} />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
      {trend.length > 0 && (
        <div className="h-8 flex items-end space-x-1">
          {trend.map((point, index) => (
            <div
              key={index}
              className={`flex-1 bg-${color}-200 rounded-sm`}
              style={{ height: `${(point / Math.max(...trend)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Analytics;