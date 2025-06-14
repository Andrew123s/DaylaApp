import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useAdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchPayments = useCallback(async (
    query: string,
    status: string,
    dateRange: string,
    page: number,
    perPage: number
  ) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call to your backend
      // For demo purposes, we'll simulate the data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock payments
      const mockPayments = Array.from({ length: 50 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        const amount = Math.floor(Math.random() * 500) + 50;
        const statuses = ['completed', 'pending', 'failed', 'refunded'];
        const status = statuses[Math.floor(Math.random() * (i % 10 === 0 ? 4 : 3))]; // More completed than others
        
        return {
          id: `payment-${i + 1}`,
          transaction_id: `txn_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`,
          description: `Payment for ${['Paris trip', 'Tokyo adventure', 'New York visit', 'London weekend'][i % 4]}`,
          amount,
          currency: 'USD',
          payment_method: ['card', 'paypal', 'apple', 'bank'][i % 4],
          status,
          user: {
            name: `User ${i % 10 + 1}`,
            email: `user${i % 10 + 1}@example.com`
          },
          created_at: date.toISOString(),
          processed_at: status === 'completed' ? date.toISOString() : null
        };
      });
      
      // Filter payments based on query, status, and date range
      let filteredPayments = mockPayments;
      
      if (query) {
        filteredPayments = filteredPayments.filter(payment => 
          payment.transaction_id.toLowerCase().includes(query.toLowerCase()) || 
          payment.description.toLowerCase().includes(query.toLowerCase()) ||
          payment.user.name.toLowerCase().includes(query.toLowerCase()) ||
          payment.user.email.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      if (status !== 'all') {
        filteredPayments = filteredPayments.filter(payment => payment.status === status);
      }
      
      if (dateRange !== 'all') {
        const now = new Date();
        let cutoff = new Date();
        
        if (dateRange === '24h') {
          cutoff.setDate(now.getDate() - 1);
        } else if (dateRange === '7d') {
          cutoff.setDate(now.getDate() - 7);
        } else if (dateRange === '30d') {
          cutoff.setDate(now.getDate() - 30);
        } else if (dateRange === '90d') {
          cutoff.setDate(now.getDate() - 90);
        }
        
        filteredPayments = filteredPayments.filter(payment => 
          new Date(payment.created_at) >= cutoff
        );
      }
      
      // Paginate results
      const start = (page - 1) * perPage;
      const paginatedPayments = filteredPayments.slice(start, start + perPage);
      
      // Calculate payment stats
      const totalRevenue = filteredPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;
      const failedPayments = filteredPayments.filter(p => p.status === 'failed').length;
      
      const paymentMethodCounts: Record<string, { count: number, amount: number }> = {};
      filteredPayments.forEach(p => {
        if (p.status === 'completed') {
          if (!paymentMethodCounts[p.payment_method]) {
            paymentMethodCounts[p.payment_method] = { count: 0, amount: 0 };
          }
          paymentMethodCounts[p.payment_method].count += 1;
          paymentMethodCounts[p.payment_method].amount += p.amount;
        }
      });
      
      const paymentMethods = Object.entries(paymentMethodCounts).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: data.count,
        amount: data.amount,
        percentage: Math.round((data.amount / totalRevenue) * 100)
      }));
      
      setPayments(paginatedPayments);
      setPaymentStats({
        totalPayments: filteredPayments.length,
        totalRevenue,
        pendingPayments,
        failedPayments,
        paymentMethods
      });
    } catch (error) {
      console.error('Error searching payments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refundPayment = useCallback(async (paymentId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Refunding payment ${paymentId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId ? { ...payment, status: 'refunded' } : payment
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error refunding payment:', error);
      return false;
    }
  }, []);

  const blockPayment = useCallback(async (paymentId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Blocking payment ${paymentId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId ? { ...payment, status: 'blocked' } : payment
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error blocking payment:', error);
      return false;
    }
  }, []);

  const exportPayments = useCallback((query: string, status: string, dateRange: string) => {
    // In a real implementation, this would generate a CSV or Excel file
    console.log(`Exporting payments with query: ${query}, status: ${status}, date range: ${dateRange}`);
    
    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob(
      [JSON.stringify(payments, null, 2)], 
      { type: 'application/json' }
    );
    element.href = URL.createObjectURL(file);
    element.download = 'payments_export.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [payments]);

  const getPaymentDetails = useCallback(async (paymentId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Getting details for payment ${paymentId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find payment in local state
      const payment = payments.find(p => p.id === paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      // Add additional details
      return {
        ...payment,
        trip: {
          id: `trip-${Math.floor(Math.random() * 10) + 1}`,
          title: `Trip to ${['Paris', 'Tokyo', 'New York', 'London'][Math.floor(Math.random() * 4)]}`,
          description: `A wonderful journey to ${['Paris', 'Tokyo', 'New York', 'London'][Math.floor(Math.random() * 4)]}`
        }
      };
    } catch (error) {
      console.error('Error getting payment details:', error);
      return null;
    }
  }, [payments]);

  return {
    payments,
    paymentStats,
    isLoading,
    searchPayments,
    refundPayment,
    blockPayment,
    exportPayments,
    getPaymentDetails
  };
};