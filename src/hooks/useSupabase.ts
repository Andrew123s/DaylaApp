import { useEffect, useState } from 'react';
import { supabase, subscribeToTrip, subscribeToChat, apiCall } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Hook for real-time trip collaboration
export const useTripCollaboration = (tripId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!tripId) return;

    const channel = subscribeToTrip(tripId, (payload) => {
      console.log('Real-time update:', payload);
      
      switch (payload.table) {
        case 'user_presence':
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setActiveUsers(prev => {
              const filtered = prev.filter(user => user.user_id !== payload.new.user_id);
              return [...filtered, payload.new];
            });
          } else if (payload.eventType === 'DELETE') {
            setActiveUsers(prev => prev.filter(user => user.user_id !== payload.old.user_id));
          }
          break;
          
        case 'live_notifications':
          if (payload.eventType === 'INSERT') {
            setLiveNotifications(prev => [...prev, payload.new]);
            
            // Auto-remove notifications after 5 seconds if auto_hide is true
            if (payload.new.auto_hide) {
              setTimeout(() => {
                setLiveNotifications(prev => prev.filter(n => n.id !== payload.new.id));
              }, 5000);
            }
          }
          break;
      }
    });

    setIsConnected(true);

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [tripId]);

  const updatePresence = async (action: string) => {
    try {
      await apiCall('trip-collaboration', {
        action: 'update_presence',
        tripId,
        data: { currentAction: action }
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const addLiveNotification = async (type: string, message: string, userName: string, userAvatar?: string) => {
    try {
      await apiCall('trip-collaboration', {
        action: 'add_live_notification',
        tripId,
        data: {
          notificationType: type,
          message,
          userName,
          userAvatar,
          autoHide: true
        }
      });
    } catch (error) {
      console.error('Error adding live notification:', error);
    }
  };

  const dismissNotification = (notificationId: string) => {
    setLiveNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return {
    isConnected,
    activeUsers,
    liveNotifications,
    updatePresence,
    addLiveNotification,
    dismissNotification
  };
};

// Hook for payment processing
export const usePayments = (tripId: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  const processPayment = async (paymentData: any) => {
    setIsProcessing(true);
    try {
      const result = await apiCall('payment-processing', {
        action: 'process_payment',
        tripId,
        paymentData
      });
      
      // Refresh payment history
      await getPaymentHistory();
      
      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentHistory = async () => {
    try {
      const result = await apiCall('payment-processing', {
        action: 'get_payment_history',
        tripId
      });
      setPaymentHistory(result.payments || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const sendPaymentReminder = async (userId: string, amount: number, currency: string) => {
    try {
      await apiCall('payment-processing', {
        action: 'send_payment_reminder',
        tripId,
        paymentData: { userId, amount, currency }
      });
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (tripId) {
      getPaymentHistory();
    }
  }, [tripId]);

  return {
    isProcessing,
    paymentHistory,
    processPayment,
    sendPaymentReminder,
    refreshPaymentHistory: getPaymentHistory
  };
};

// Hook for sustainability tracking
export const useSustainability = (tripId: string) => {
  const [sustainabilityData, setSustainabilityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateTransportFootprint = async (transportType: string, distance: number, passengers = 1) => {
    setIsLoading(true);
    try {
      const result = await apiCall('sustainability-tracking', {
        action: 'calculate_transport_footprint',
        tripId,
        data: { transportType, distance, passengers }
      });
      
      await getSustainabilityReport();
      return result;
    } catch (error) {
      console.error('Error calculating transport footprint:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addOffsetContribution = async (projectId: string, amountUsd: number, carbonOffsetKg: number) => {
    setIsLoading(true);
    try {
      const result = await apiCall('sustainability-tracking', {
        action: 'add_offset_contribution',
        tripId,
        data: { projectId, amountUsd, carbonOffsetKg }
      });
      
      await getSustainabilityReport();
      return result;
    } catch (error) {
      console.error('Error adding offset contribution:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSustainabilityReport = async () => {
    setIsLoading(true);
    try {
      const result = await apiCall('sustainability-tracking', {
        action: 'get_sustainability_report',
        tripId
      });
      setSustainabilityData(result.sustainability);
      return result;
    } catch (error) {
      console.error('Error fetching sustainability report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      getSustainabilityReport();
    }
  }, [tripId]);

  return {
    sustainabilityData,
    isLoading,
    calculateTransportFootprint,
    addOffsetContribution,
    refreshReport: getSustainabilityReport
  };
};

// Hook for chat functionality
export const useChat = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: any[] }>({});
  const [isLoading, setIsLoading] = useState(false);

  const createChat = async (chatType: 'direct' | 'group', participants: string[], name?: string, tripId?: string) => {
    setIsLoading(true);
    try {
      const result = await apiCall('chat-management', {
        action: 'create_chat',
        data: { chatType, name, participants, tripId }
      });
      
      await getUserChats();
      return result.chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (chatId: string, content: string, messageType = 'text', imageUrl?: string) => {
    try {
      const result = await apiCall('chat-management', {
        action: 'send_message',
        data: { chatId, content, messageType, imageUrl }
      });
      
      // Add message to local state immediately for better UX
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), result.message]
      }));
      
      return result.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const getUserChats = async () => {
    setIsLoading(true);
    try {
      const result = await apiCall('chat-management', {
        action: 'get_user_chats'
      });
      setChats(result.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChatMessages = async (chatId: string, limit = 50, offset = 0) => {
    try {
      const result = await apiCall('chat-management', {
        action: 'get_chat_messages',
        data: { chatId, limit, offset }
      });
      
      setMessages(prev => ({
        ...prev,
        [chatId]: result.messages || []
      }));
      
      return result.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  const addParticipants = async (chatId: string, participantIds: string[]) => {
    try {
      await apiCall('chat-management', {
        action: 'add_participants',
        data: { chatId, participantIds }
      });
      
      await getUserChats();
    } catch (error) {
      console.error('Error adding participants:', error);
      throw error;
    }
  };

  // Subscribe to chat messages
  const subscribeToMessages = (chatId: string) => {
    return subscribeToChat(chatId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), payload.new]
        }));
      }
    });
  };

  return {
    chats,
    messages,
    isLoading,
    createChat,
    sendMessage,
    getUserChats,
    getChatMessages,
    addParticipants,
    subscribeToMessages
  };
};

// Hook for database operations
export const useDatabase = () => {
  const { user } = useAuth();

  const createTrip = async (tripData: any) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trips')
      .insert({
        ...tripData,
        owner_id: user.id,
        collaborators: [user.id]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTrip = async (tripId: string, updates: any) => {
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getUserTrips = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        trip_collaborators(
          user_id,
          role,
          user_profiles(name, avatar_url)
        )
      `)
      .or(`owner_id.eq.${user.id},collaborators.cs.{${user.id}}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const joinTripByInvite = async (inviteCode: string) => {
    if (!user) throw new Error('User not authenticated');

    const result = await apiCall('trip-collaboration', {
      action: 'join_trip',
      data: { inviteCode }
    });

    return result;
  };

  // Budget operations
  const createBudget = async (tripId: string, budgetData: any) => {
    const { data, error } = await supabase
      .from('trip_budgets')
      .insert({
        trip_id: tripId,
        ...budgetData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const addExpense = async (tripId: string, expenseData: any) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        created_by: user?.id,
        ...expenseData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getExpenses = async (tripId: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_splits(
          *,
          user_profiles(name, avatar_url)
        )
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Packing operations
  const createPackingList = async (tripId: string) => {
    const { data, error } = await supabase
      .from('packing_lists')
      .insert({
        trip_id: tripId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const addPackingItem = async (packingListId: string, itemData: any) => {
    const { data, error } = await supabase
      .from('packing_items')
      .insert({
        packing_list_id: packingListId,
        last_updated_by: user?.id,
        ...itemData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getPackingItems = async (packingListId: string) => {
    const { data, error } = await supabase
      .from('packing_items')
      .select('*')
      .eq('packing_list_id', packingListId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Sustainability operations
  const createSustainabilityData = async (tripId: string) => {
    const { data, error } = await supabase
      .from('trip_sustainability')
      .insert({
        trip_id: tripId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateCarbonFootprint = async (tripId: string, footprintData: any) => {
    const { data, error } = await supabase
      .from('trip_sustainability')
      .update({
        carbon_footprint: footprintData
      })
      .eq('trip_id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return {
    createTrip,
    updateTrip,
    getUserTrips,
    joinTripByInvite,
    createBudget,
    addExpense,
    getExpenses,
    createPackingList,
    addPackingItem,
    getPackingItems,
    createSustainabilityData,
    updateCarbonFootprint
  };
};