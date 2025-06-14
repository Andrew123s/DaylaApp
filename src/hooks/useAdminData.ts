import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useAdminData = () => {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, these would be API calls to your backend
      // For demo purposes, we'll simulate the data

      // Fetch dashboard stats
      const stats = {
        totalUsers: 1254,
        userGrowth: 12.5,
        activeTrips: 387,
        tripGrowth: 8.3,
        revenue: 28750,
        revenueGrowth: 15.2,
        supportTickets: 8,
        ticketChange: -4.2
      };
      setDashboardStats(stats);

      // Fetch recent activity
      const activity = [
        {
          type: 'user_signup',
          description: 'New user registered: Sarah Johnson',
          timestamp: '10 minutes ago'
        },
        {
          type: 'payment_processed',
          description: 'Payment of $125.00 processed for trip to Paris',
          timestamp: '25 minutes ago'
        },
        {
          type: 'trip_created',
          description: 'New trip created: Weekend in Barcelona',
          timestamp: '1 hour ago'
        },
        {
          type: 'support_ticket',
          description: 'New support ticket: Payment issue #1234',
          timestamp: '2 hours ago'
        },
        {
          type: 'user_signup',
          description: 'New user registered: Michael Chen',
          timestamp: '3 hours ago'
        }
      ];
      setRecentActivity(activity);

      // Fetch system health
      const health = {
        status: 'healthy', // 'healthy', 'warning', 'error'
        message: 'All systems operational',
        database: 'healthy',
        api: 'healthy',
        payments: 'healthy',
        storage: 'healthy'
      };
      setSystemHealth(health);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    dashboardStats,
    recentActivity,
    systemHealth,
    isLoading,
    refreshData
  };
};