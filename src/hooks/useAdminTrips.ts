import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useAdminTrips = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const searchTrips = useCallback(async (
    query: string,
    status: string,
    dateFilter: string,
    page: number,
    perPage: number
  ) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would be an API call to your backend
      // For demo purposes, we'll simulate the data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock trips
      const mockTrips = Array.from({ length: 50 }, (_, i) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 30); // -30 to +30 days
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1 to 14 days
        
        return {
          id: `trip-${i + 1}`,
          title: `Trip to ${['Paris', 'Tokyo', 'New York', 'London', 'Sydney', 'Rome', 'Barcelona'][i % 7]}`,
          description: `Exploring ${['Paris', 'Tokyo', 'New York', 'London', 'Sydney', 'Rome', 'Barcelona'][i % 7]} for a few days`,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          color: ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4'][i % 7],
          status: i % 15 === 0 ? 'suspended' : 'active',
          is_public: i % 3 === 0,
          is_flagged: i % 20 === 0,
          owner: {
            name: `User ${i % 10 + 1}`,
            email: `user${i % 10 + 1}@example.com`
          },
          collaborator_count: Math.floor(Math.random() * 5) + 1,
          budget: Math.floor(Math.random() * 5000) + 500,
          created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        };
      });
      
      // Filter trips based on query, status, and date
      let filteredTrips = mockTrips;
      
      if (query) {
        filteredTrips = filteredTrips.filter(trip => 
          trip.title.toLowerCase().includes(query.toLowerCase()) || 
          trip.description.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      if (status !== 'all') {
        if (status === 'flagged') {
          filteredTrips = filteredTrips.filter(trip => trip.is_flagged);
        } else {
          filteredTrips = filteredTrips.filter(trip => trip.status === status);
        }
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        
        if (dateFilter === 'upcoming') {
          filteredTrips = filteredTrips.filter(trip => new Date(trip.start_date) > now);
        } else if (dateFilter === 'ongoing') {
          filteredTrips = filteredTrips.filter(trip => 
            new Date(trip.start_date) <= now && new Date(trip.end_date) >= now
          );
        } else if (dateFilter === 'completed') {
          filteredTrips = filteredTrips.filter(trip => new Date(trip.end_date) < now);
        }
      }
      
      // Paginate results
      const start = (page - 1) * perPage;
      const paginatedTrips = filteredTrips.slice(start, start + perPage);
      
      setTrips(paginatedTrips);
      setTotalTrips(filteredTrips.length);
    } catch (error) {
      console.error('Error searching trips:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTripStatus = useCallback(async (tripId: string, status: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Updating trip ${tripId} status to ${status}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.id === tripId ? { ...trip, status } : trip
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating trip status:', error);
      return false;
    }
  }, []);

  const deleteTrip = useCallback(async (tripId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Deleting trip ${tripId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
      setTotalTrips(prev => prev - 1);
      
      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      return false;
    }
  }, []);

  const flagTrip = useCallback(async (tripId: string, reason: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Flagging trip ${tripId} for reason: ${reason}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.id === tripId ? { ...trip, is_flagged: true } : trip
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error flagging trip:', error);
      return false;
    }
  }, []);

  const exportTrips = useCallback((query: string, status: string, dateFilter: string) => {
    // In a real implementation, this would generate a CSV or Excel file
    console.log(`Exporting trips with query: ${query}, status: ${status}, date: ${dateFilter}`);
    
    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob(
      [JSON.stringify(trips, null, 2)], 
      { type: 'application/json' }
    );
    element.href = URL.createObjectURL(file);
    element.download = 'trips_export.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [trips]);

  const getTripDetails = useCallback(async (tripId: string) => {
    try {
      // In a real implementation, this would be an API call to your backend
      console.log(`Getting details for trip ${tripId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find trip in local state
      const trip = trips.find(t => t.id === tripId);
      
      if (!trip) {
        throw new Error('Trip not found');
      }
      
      // Add additional details
      return {
        ...trip,
        notes_count: Math.floor(Math.random() * 20),
        expenses_count: Math.floor(Math.random() * 15),
        total_spent: Math.floor(Math.random() * 2000) + 500
      };
    } catch (error) {
      console.error('Error getting trip details:', error);
      return null;
    }
  }, [trips]);

  return {
    trips,
    totalTrips,
    isLoading,
    searchTrips,
    updateTripStatus,
    deleteTrip,
    flagTrip,
    exportTrips,
    getTripDetails
  };
};