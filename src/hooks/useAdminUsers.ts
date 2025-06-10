import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = useCallback(async (
    query: string,
    status: string,
    page: number,
    perPage: number
  ) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call to your backend
      // For demo purposes, we'll simulate the data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock users
      const mockUsers = Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: i % 10 === 0 ? 'suspended' : 'active',
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        trip_count: Math.floor(Math.random() * 10),
        total_spent: Math.floor(Math.random() * 1000)
      }));
      
      // Filter users based on query and status
      let filteredUsers = mockUsers;
      
      if (query) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) || 
          user.email.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      if (status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === status);
      }
      
      // Paginate results
      const start = (page - 1) * perPage;
      const paginatedUsers = filteredUsers.slice(start, start + perPage);
      
      setUsers(paginatedUsers);
      setTotalUsers(filteredUsers.length);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (userId: string, status: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Updating user ${userId} status to ${status}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status } : user
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Deleting user ${userId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setTotalUsers(prev => prev - 1);
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }, []);

  const exportUsers = useCallback((query: string, status: string) => {
    // In a real implementation, this would generate a CSV or Excel file
    console.log(`Exporting users with query: ${query}, status: ${status}`);
    
    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob(
      [JSON.stringify(users, null, 2)], 
      { type: 'application/json' }
    );
    element.href = URL.createObjectURL(file);
    element.download = 'users_export.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [users]);

  const getUserDetails = useCallback(async (userId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Getting details for user ${userId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find user in local state
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Add additional details
      return {
        ...user,
        last_active: new Date(Date.now() - Math.random() * 1000000).toISOString(),
        recent_activity: [
          {
            description: 'Created a new trip to Paris',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            description: 'Updated profile information',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            description: 'Added a new payment method',
            timestamp: new Date(Date.now() - 172800000).toISOString()
          }
        ]
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      return null;
    }
  }, [users]);

  return {
    users,
    totalUsers,
    isLoading,
    searchUsers,
    updateUserStatus,
    deleteUser,
    exportUsers,
    getUserDetails
  };
};