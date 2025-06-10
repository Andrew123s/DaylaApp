import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Globe,
  Shield,
  Settings,
  Bell,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData } from '../../hooks/useAdminData';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    dashboardStats, 
    recentActivity, 
    systemHealth, 
    isLoading, 
    refreshData 
  } = useAdminData();
  const [timeRange, setTimeRange] = useState('7d');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
      setLastRefresh(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 ml-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}. Here's what's happening with Dayla.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button
            onClick={() => {
              refreshData();
              setLastRefresh(new Date());
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth && systemHealth.status !== 'healthy' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">System Health Alert</h3>
              <p className="text-red-700 text-sm">{systemHealth.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={dashboardStats?.totalUsers || 0}
          change={dashboardStats?.userGrowth || 0}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Active Trips"
          value={dashboardStats?.activeTrips || 0}
          change={dashboardStats?.tripGrowth || 0}
          icon={MapPin}
          color="green"
        />
        <MetricCard
          title="Revenue"
          value={`$${(dashboardStats?.revenue || 0).toLocaleString()}`}
          change={dashboardStats?.revenueGrowth || 0}
          icon={DollarSign}
          color="purple"
        />
        <MetricCard
          title="Support Tickets"
          value={dashboardStats?.supportTickets || 0}
          change={dashboardStats?.ticketChange || 0}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <StatusItem
              label="Database"
              status={systemHealth?.database || 'healthy'}
              uptime="99.9%"
            />
            <StatusItem
              label="API Services"
              status={systemHealth?.api || 'healthy'}
              uptime="99.8%"
            />
            <StatusItem
              label="Payment Processing"
              status={systemHealth?.payments || 'healthy'}
              uptime="99.7%"
            />
            <StatusItem
              label="File Storage"
              status={systemHealth?.storage || 'healthy'}
              uptime="99.9%"
            />
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

// Helper Components
interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => {
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
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

interface StatusItemProps {
  label: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, status, uptime }) => {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${
          status === 'healthy' ? 'bg-green-500' :
          status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
        <span className="text-sm text-gray-500">{uptime}</span>
      </div>
    </div>
  );
};

// Helper functions
const getActivityColor = (type: string) => {
  switch (type) {
    case 'user_signup': return 'bg-green-100 text-green-600';
    case 'trip_created': return 'bg-blue-100 text-blue-600';
    case 'payment_processed': return 'bg-purple-100 text-purple-600';
    case 'support_ticket': return 'bg-orange-100 text-orange-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user_signup': return <Users className="h-4 w-4" />;
    case 'trip_created': return <MapPin className="h-4 w-4" />;
    case 'payment_processed': return <DollarSign className="h-4 w-4" />;
    case 'support_ticket': return <AlertTriangle className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
};

export default AdminDashboard;