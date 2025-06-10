import React, { createContext, useContext, useState } from 'react';

export interface StickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  emoji?: string;
  linkedTo?: string[];
  images?: string[];
  voiceNote?: string;
  timestamp: Date;
  lastEditedBy?: string;
  editingUsers?: string[]; // Users currently editing this note
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: Date;
  location?: string;
  paidBy: string;
  splitBetween: ExpenseSplit[];
  receiptImage?: string;
  isSettled: boolean;
  createdBy: string;
  timestamp: Date;
}

export interface ExpenseSplit {
  userId: string;
  userName: string;
  amount: number;
  isSettled: boolean;
}

export interface Payment {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId?: string;
  toUserName?: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'card' | 'paypal' | 'apple' | 'bank';
  transactionId?: string;
  expenseId?: string;
  settlementId?: string;
  splitId?: string;
  processedAt?: Date;
  createdAt: Date;
}

export interface Budget {
  totalBudget: number;
  currency: string;
  categoryBudgets: CategoryBudget[];
  expenses: Expense[];
  settlements: Settlement[];
  payments?: Payment[];
  paymentDeadline?: Date;
  reminderSettings?: {
    enabled: boolean;
    daysBefore: number;
  };
}

export interface CategoryBudget {
  category: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface Settlement {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  currency: string;
  isSettled: boolean;
  settledDate?: Date;
  paymentMethod?: string;
}

// Sustainability interfaces
export interface CarbonFootprint {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
  treeEquivalent: number;
}

export interface TransportOption {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'ferry';
  name: string;
  duration: number; // in hours
  carbonPerKm: number; // kg CO2 per km
  distance: number; // in km
  totalCarbon: number;
  cost?: number;
  isRecommended?: boolean;
}

export interface AccommodationOption {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'airbnb' | 'eco-lodge' | 'camping';
  carbonPerNight: number;
  waterUsage: number; // liters per night
  energyUsage: number; // kWh per night
  certifications: string[];
  sustainabilityScore: number; // 1-10
  seasonalImpact: 'low' | 'medium' | 'high';
  alternatives?: AccommodationAlternative[];
}

export interface AccommodationAlternative {
  name: string;
  reductionPercentage: number;
  description: string;
}

export interface OffsetProject {
  id: string;
  name: string;
  type: 'forest' | 'renewable' | 'community' | 'technology';
  description: string;
  image: string;
  costPerTon: number; // USD per ton CO2
  location: string;
  impact: string;
  certification: string;
  totalOffset: number; // tons CO2 offset so far
}

export interface SustainabilityData {
  carbon_footprint: CarbonFootprint;
  transportOptions: TransportOption[];
  accommodationOptions: AccommodationOption[];
  offsetProjects: OffsetProject[];
  offsetContributions: OffsetContribution[];
  sustainabilityGoals: SustainabilityGoal[];
  pastTripsComparison: TripComparison[];
}

export interface OffsetContribution {
  id: string;
  projectId: string;
  amount: number; // USD
  carbonOffset: number; // kg CO2
  date: Date;
  status: 'pending' | 'completed';
}

export interface SustainabilityGoal {
  id: string;
  type: 'carbon_reduction' | 'offset_target' | 'sustainable_transport';
  target: number;
  current: number;
  unit: string;
  deadline: Date;
}

export interface TripComparison {
  tripName: string;
  carbonFootprint: number;
  date: Date;
}

// Smart Pak interfaces
export interface PackingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  weight: number; // in grams
  volume: number; // in cubic cm
  status: 'packed' | 'purchased' | 'missing';
  assignedTo?: string;
  isShared: boolean;
  priority: 'essential' | 'recommended' | 'optional';
  weatherDependent: boolean;
  activitySpecific: string[];
  notes?: string;
  estimatedCost?: number;
  purchaseLink?: string;
  timestamp: Date;
  lastUpdatedBy?: string;
}

export interface PackingList {
  id: string;
  tripId: string;
  items: PackingItem[];
  luggageType: 'carry-on' | 'checked' | 'personal';
  totalWeight: number;
  totalVolume: number;
  lastUpdated: Date;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
  notes: StickyNote[];
  collaborators: string[];
  inviteCode: string;
  isPublic: boolean;
  activeUsers?: ActiveUser[];
  notifications?: TripNotification[];
  budget?: Budget;
  sustainability?: SustainabilityData;
  packingList?: PackingList;
  liveNotifications?: LiveNotification[]; // Real-time notifications
}

export interface ActiveUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastActivity: Date;
  isActive: boolean;
  currentAction?: string;
  role?: 'owner' | 'editor' | 'viewer';
}

export interface TripNotification {
  id: string;
  type: 'user_joined' | 'user_editing' | 'note_added' | 'note_updated' | 'note_deleted' | 'expense_added' | 'expense_updated' | 'settlement_requested' | 'sustainability_goal_achieved' | 'packing_item_added' | 'packing_item_updated' | 'payment_completed' | 'payment_failed' | 'payment_reminder';
  message: string;
  userId: string;
  userName: string;
  timestamp: Date;
  read: boolean;
}

export interface LiveNotification {
  id: string;
  type: 'user_joined' | 'user_left' | 'note_added' | 'note_updated' | 'note_deleted' | 'user_editing' | 'payment_completed';
  message: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  autoHide?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  image?: string;
  type: 'text' | 'image' | 'voice';
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: string[];
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  images?: string[];
  location: string;
  tags: string[];
  timestamp: Date;
  likes: number;
  comments: ForumComment[];
}

export interface ForumComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: ForumComment[];
}

interface AppContextType {
  trips: Trip[];
  chats: Chat[];
  forumPosts: ForumPost[];
  activeTrip: Trip | null;
  createTrip: (trip: Omit<Trip, 'id' | 'inviteCode' | 'activeUsers' | 'notifications'>) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  setActiveTrip: (trip: Trip | null) => void;
  addStickyNote: (tripId: string, note: Omit<StickyNote, 'id' | 'timestamp'>) => void;
  updateStickyNote: (tripId: string, noteId: string, updates: Partial<StickyNote>) => void;
  deleteStickyNote: (tripId: string, noteId: string) => void;
  sendMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  createForumPost: (post: Omit<ForumPost, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
  addForumComment: (postId: string, comment: Omit<ForumComment, 'id' | 'timestamp' | 'likes' | 'replies'>) => void;
  joinTripByInvite: (inviteCode: string, userId: string, userName: string, userAvatar?: string) => boolean;
  updateUserActivity: (tripId: string, userId: string, action?: string) => void;
  addNotification: (tripId: string, notification: Omit<TripNotification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (tripId: string, notificationId: string) => void;
  // Budget functions
  initializeBudget: (tripId: string, totalBudget: number, currency: string) => void;
  addExpense: (tripId: string, expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  updateExpense: (tripId: string, expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  settleExpense: (tripId: string, expenseId: string, userId: string) => void;
  requestSettlement: (tripId: string, fromUserId: string, toUserId: string, amount: number) => void;
  markSettlementPaid: (tripId: string, settlementId: string, paymentMethod: string) => void;
  // Payment functions
  processPayment: (tripId: string, paymentData: Omit<Payment, 'id' | 'createdAt'>) => void;
  setPaymentDeadline: (tripId: string, deadline: Date) => void;
  sendPaymentReminder: (tripId: string, userId: string) => void;
  // Sustainability functions
  initializeSustainability: (tripId: string) => void;
  updateCarbonFootprint: (tripId: string, footprint: Partial<CarbonFootprint>) => void;
  addTransportOption: (tripId: string, option: TransportOption) => void;
  selectTransportOption: (tripId: string, optionId: string) => void;
  addOffsetContribution: (tripId: string, contribution: Omit<OffsetContribution, 'id' | 'date'>) => void;
  updateSustainabilityGoal: (tripId: string, goalId: string, progress: number) => void;
  // Smart Pak functions
  initializePackingList: (tripId: string) => void;
  addPackingItem: (tripId: string, item: Omit<PackingItem, 'id' | 'timestamp'>) => void;
  updatePackingItem: (tripId: string, itemId: string, updates: Partial<PackingItem>) => void;
  deletePackingItem: (tripId: string, itemId: string) => void;
  togglePackingItemStatus: (tripId: string, itemId: string, status: 'packed' | 'purchased' | 'missing') => void;
  assignPackingItem: (tripId: string, itemId: string, userId: string) => void;
  updateLuggageType: (tripId: string, luggageType: 'carry-on' | 'checked' | 'personal') => void;
  // Real-time collaboration functions
  addLiveNotification: (tripId: string, notification: Omit<LiveNotification, 'id' | 'timestamp'>) => void;
  dismissLiveNotification: (tripId: string, notificationId: string) => void;
  updateUserRole: (tripId: string, userId: string, role: 'viewer' | 'editor') => void;
  removeCollaborator: (tripId: string, userId: string) => void;
  setNoteEditingUser: (tripId: string, noteId: string, userId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: 'a0e1b2c3-d4f5-6789-0123-456789abcdef',
      title: 'Iceland Adventure',
      description: 'Exploring the land of fire and ice',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-25'),
      color: '#0EA5E9',
      notes: [
        {
          id: 'b1f2c3d4-e5f6-7890-1234-56789abcdef0',
          content: 'Visit Blue Lagoon 🌊',
          x: 100,
          y: 100,
          color: '#0EA5E9',
          emoji: '🌊',
          timestamp: new Date()
        },
        {
          id: 'c2f3d4e5-f6g7-8901-2345-6789abcdef01',
          content: 'Northern Lights tour ✨',
          x: 300,
          y: 150,
          color: '#8B5CF6',
          emoji: '✨',
          linkedTo: ['b1f2c3d4-e5f6-7890-1234-56789abcdef0'],
          timestamp: new Date()
        }
      ],
      collaborators: ['d3f4e5f6-g7h8-9012-3456-789abcdef012'],
      inviteCode: 'ICELAND2024',
      isPublic: false,
      activeUsers: [
        {
          userId: 'd3f4e5f6-g7h8-9012-3456-789abcdef012',
          userName: 'Adventure Seeker',
          userAvatar: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          lastActivity: new Date(),
          isActive: true,
          currentAction: 'viewing board',
          role: 'owner'
        }
      ],
      notifications: [],
      liveNotifications: [],
      budget: {
        totalBudget: 5000,
        currency: 'USD',
        categoryBudgets: [
          { category: 'Accommodation', allocated: 2000, spent: 1200, color: '#3B82F6' },
          { category: 'Transportation', allocated: 1500, spent: 800, color: '#10B981' },
          { category: 'Activities', allocated: 1000, spent: 450, color: '#F59E0B' },
          { category: 'Food', allocated: 500, spent: 320, color: '#EF4444' }
        ],
        expenses: [
          {
            id: 'e4f5g6h7-i8j9-0123-4567-89abcdef0123',
            amount: 600,
            currency: 'USD',
            category: 'Accommodation',
            description: 'Hotel booking for 3 nights',
            date: new Date('2024-06-15'),
            location: 'Reykjavik',
            paidBy: 'd3f4e5f6-g7h8-9012-3456-789abcdef012',
            splitBetween: [
              { userId: 'd3f4e5f6-g7h8-9012-3456-789abcdef012', userName: 'Adventure Seeker', amount: 300, isSettled: true },
              { userId: 'f5g6h7i8-j9k0-1234-5678-9abcdef01234', userName: 'Travel Buddy', amount: 300, isSettled: false }
            ],
            isSettled: false,
            createdBy: 'd3f4e5f6-g7h8-9012-3456-789abcdef012',
            timestamp: new Date()
          }
        ],
        settlements: [],
        payments: []
      },
      sustainability: {
        carbon_footprint: {
          transport: 2450,
          accommodation: 180,
          food: 120,
          activities: 85,
          total: 2835,
          treeEquivalent: 129
        },
        transportOptions: [
          {
            id: 'g6h7i8j9-k0l1-2345-6789-abcdef012345',
            type: 'flight',
            name: 'Direct Flight',
            duration: 5.5,
            carbonPerKm: 0.255,
            distance: 4200,
            totalCarbon: 1071,
            cost: 450,
            isRecommended: false
          },
          {
            id: 'h7i8j9k0-l1m2-3456-789a-bcdef0123456',
            type: 'train',
            name: 'Train + Ferry',
            duration: 24,
            carbonPerKm: 0.041,
            distance: 4200,
            totalCarbon: 172.2,
            cost: 320,
            isRecommended: true
          }
        ],
        accommodationOptions: [
          {
            id: 'i8j9k0l1-m2n3-4567-89ab-cdef01234567',
            name: 'Eco Lodge Reykjavik',
            type: 'eco-lodge',
            carbonPerNight: 12,
            waterUsage: 150,
            energyUsage: 8,
            certifications: ['Green Key', 'EarthCheck'],
            sustainabilityScore: 9,
            seasonalImpact: 'low',
            alternatives: [
              { name: 'Solar-powered cabin', reductionPercentage: 35, description: 'Off-grid accommodation with renewable energy' }
            ]
          }
        ],
        offsetProjects: [
          {
            id: 'j9k0l1m2-n3o4-5678-9abc-def012345678',
            name: 'Iceland Reforestation Project',
            type: 'forest',
            description: 'Planting native trees to restore Iceland\'s forests and combat soil erosion',
            image: 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?auto=compress&cs=tinysrgb&w=800',
            costPerTon: 25,
            location: 'Iceland',
            impact: '50,000 trees planted annually',
            certification: 'Gold Standard',
            totalOffset: 1250
          },
          {
            id: 'k0l1m2n3-o4p5-6789-abcd-ef0123456789',
            name: 'Geothermal Energy Expansion',
            type: 'renewable',
            description: 'Supporting renewable geothermal energy infrastructure in Iceland',
            image: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=800',
            costPerTon: 18,
            location: 'Iceland',
            impact: '2.5 MW clean energy capacity',
            certification: 'VCS',
            totalOffset: 2100
          }
        ],
        offsetContributions: [],
        sustainabilityGoals: [
          {
            id: 'l1m2n3o4-p5q6-789a-bcde-f01234567890',
            type: 'carbon_reduction',
            target: 50,
            current: 25,
            unit: '% reduction',
            deadline: new Date('2024-06-15')
          }
        ],
        pastTripsComparison: [
          { tripName: 'Paris Weekend', carbonFootprint: 1200, date: new Date('2024-03-15') },
          { tripName: 'Tokyo Adventure', carbonFootprint: 4500, date: new Date('2024-01-10') }
        ]
      },
      packingList: {
        id: 'm2n3o4p5-q6r7-89ab-cdef-012345678901',
        tripId: 'a0e1b2c3-d4f5-6789-0123-456789abcdef',
        items: [
          {
            id: 'n3o4p5q6-r7s8-9abc-def0-123456789012',
            name: 'Waterproof Jacket',
            category: 'Clothing',
            quantity: 1,
            weight: 450,
            volume: 2000,
            status: 'packed',
            assignedTo: 'd3f4e5f6-g7h8-9012-3456-789abcdef012',
            isShared: false,
            priority: 'essential',
            weatherDependent: true,
            activitySpecific: ['hiking', 'sightseeing'],
            notes: 'Gore-tex recommended for Iceland weather',
            timestamp: new Date()
          },
          {
            id: 'o4p5q6r7-s8t9-abcd-ef01-234567890123',
            name: 'Thermal Underwear',
            category: 'Clothing',
            quantity: 3,
            weight: 200,
            volume: 800,
            status: 'purchased',
            assignedTo: 'd3f4e5f6-g7h8-9012-3456-789abcdef012',
            isShared: false,
            priority: 'essential',
            weatherDependent: true,
            activitySpecific: ['hiking', 'outdoor'],
            timestamp: new Date()
          },
          {
            id: 'p5q6r7s8-t9u0-bcde-f012-345678901234',
            name: 'Camera + Lenses',
            category: 'Electronics',
            quantity: 1,
            weight: 1200,
            volume: 3500,
            status: 'packed',
            assignedTo: 'd3f4e5f6-g7h8-9012-3456-789abcdef012',
            isShared: false,
            priority: 'recommended',
            weatherDependent: false,
            activitySpecific: ['photography', 'sightseeing'],
            timestamp: new Date()
          },
          {
            id: 'q6r7s8t9-u0v1-cdef-0123-456789012345',
            name: 'Portable Charger',
            category: 'Electronics',
            quantity: 1,
            weight: 300,
            volume: 500,
            status: 'missing',
            assignedTo: 'd3f4e5f6-g7h8-9012-3456-789abcdef012',
            isShared: true,
            priority: 'essential',
            weatherDependent: false,
            activitySpecific: ['all'],
            timestamp: new Date()
          },
          {
            id: 'r7s8t9u0-v1w2-def0-1234-567890123456',
            name: 'First Aid Kit',
            category: 'Health & Safety',
            quantity: 1,
            weight: 400,
            volume: 1200,
            status: 'packed',
            isShared: true,
            priority: 'essential',
            weatherDependent: false,
            activitySpecific: ['hiking', 'outdoor'],
            timestamp: new Date()
          }
        ],
        luggageType: 'carry-on',
        totalWeight: 2550,
        totalVolume: 8000,
        lastUpdated: new Date()
      }
    }
  ]);

  const [chats, setChats] = useState<Chat[]>([
    {
      id: 's8t9u0v1-w2x3-ef01-2345-678901234567',
      type: 'group',
      name: 'Iceland Planning Group',
      participants: ['d3f4e5f6-g7h8-9012-3456-789abcdef012', 'f5g6h7i8-j9k0-1234-5678-9abcdef01234', 't9u0v1w2-x3y4-f012-3456-789012345678'],
      messages: [
        {
          id: 'u0v1w2x3-y4z5-0123-4567-890123456789',
          senderId: 'd3f4e5f6-g7h8-9012-3456-789abcdef012',
          senderName: 'Adventure Seeker',
          content: 'Hey everyone! Excited for our Iceland trip!',
          timestamp: new Date(),
          type: 'text'
        }
      ]
    }
  ]);

  const [forumPosts, setForumPosts] = useState<ForumPost[]>([
    {
      id: 'v1w2x3y4-z5a6-1234-5678-90123456789a',
      authorId: 'd3f4e5f6-g7h8-9012-3456-789abcdef012',
      authorName: 'Adventure Seeker',
      authorAvatar: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      title: 'Amazing Northern Lights in Iceland!',
      content: 'Just got back from Iceland and the Northern Lights were absolutely spectacular! Here are some tips for the best viewing experience...',
      images: ['https://images.pexels.com/photos/1933316/pexels-photo-1933316.jpeg?auto=compress&cs=tinysrgb&w=800'],
      location: 'Reykjavik, Iceland',
      tags: ['Northern Lights', 'Iceland', 'Photography'],
      timestamp: new Date(),
      likes: 24,
      comments: []
    }
  ]);

  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const createTrip = (tripData: Omit<Trip, 'id' | 'inviteCode' | 'activeUsers' | 'notifications'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: crypto.randomUUID(),
      inviteCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
      activeUsers: [],
      notifications: [],
      liveNotifications: []
    };
    setTrips(prev => [...prev, newTrip]);
  };

  const updateTrip = (tripId: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, ...updates } : trip
    ));
  };

  const addStickyNote = (tripId: string, noteData: Omit<StickyNote, 'id' | 'timestamp'>) => {
    const newNote: StickyNote = {
      ...noteData,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, notes: [...trip.notes, newNote] }
        : trip
    ));

    if (noteData.lastEditedBy) {
      addNotification(tripId, {
        type: 'note_added',
        message: `${noteData.lastEditedBy} added a new note`,
        userId: noteData.lastEditedBy,
        userName: noteData.lastEditedBy,
        read: false
      });

      addLiveNotification(tripId, {
        type: 'note_added',
        message: 'added a new note',
        userName: noteData.lastEditedBy,
        autoHide: true
      });
    }
  };

  const updateStickyNote = (tripId: string, noteId: string, updates: Partial<StickyNote>) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            notes: trip.notes.map(note => 
              note.id === noteId ? { ...note, ...updates } : note
            )
          }
        : trip
    ));

    if (updates.lastEditedBy) {
      addNotification(tripId, {
        type: 'note_updated',
        message: `${updates.lastEditedBy} updated a note`,
        userId: updates.lastEditedBy,
        userName: updates.lastEditedBy,
        read: false
      });

      addLiveNotification(tripId, {
        type: 'note_updated',
        message: 'updated a note',
        userName: updates.lastEditedBy,
        autoHide: true
      });
    }
  };

  const deleteStickyNote = (tripId: string, noteId: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, notes: trip.notes.filter(note => note.id !== noteId) }
        : trip
    ));
  };

  const sendMessage = (chatId: string, messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, newMessage],
            lastMessage: newMessage
          }
        : chat
    ));
  };

  const createForumPost = (postData: Omit<ForumPost, 'id' | 'timestamp' | 'likes' | 'comments'>) => {
    const newPost: ForumPost = {
      ...postData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      likes: 0,
      comments: []
    };
    setForumPosts(prev => [newPost, ...prev]);
  };

  const addForumComment = (postId: string, commentData: Omit<ForumComment, 'id' | 'timestamp' | 'likes' | 'replies'>) => {
    const newComment: ForumComment = {
      ...commentData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      likes: 0,
      replies: []
    };

    setForumPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    ));
  };

  const joinTripByInvite = (inviteCode: string, userId: string, userName: string, userAvatar?: string): boolean => {
    const trip = trips.find(t => t.inviteCode === inviteCode);
    if (!trip) return false;

    if (trip.collaborators.includes(userId)) return true;

    setTrips(prev => prev.map(t => 
      t.id === trip.id 
        ? { 
            ...t, 
            collaborators: [...t.collaborators, userId],
            activeUsers: [...(t.activeUsers || []), {
              userId,
              userName,
              userAvatar,
              lastActivity: new Date(),
              isActive: true,
              role: 'editor' // Default role for new users
            }]
          }
        : t
    ));

    addNotification(trip.id, {
      type: 'user_joined',
      message: `${userName} joined ${trip.title}`,
      userId,
      userName,
      read: false
    });

    addLiveNotification(trip.id, {
      type: 'user_joined',
      message: `joined the trip`,
      userName,
      userAvatar,
      autoHide: true
    });

    return true;
  };

  const updateUserActivity = (tripId: string, userId: string, action?: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            activeUsers: trip.activeUsers?.map(user => 
              user.userId === userId 
                ? { 
                    ...user, 
                    lastActivity: new Date(), 
                    isActive: true,
                    currentAction: action 
                  }
                : user
            ) || []
          }
        : trip
    ));
  };

  const addNotification = (tripId: string, notificationData: Omit<TripNotification, 'id' | 'timestamp'>) => {
    const newNotification: TripNotification = {
      ...notificationData,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { 
            ...trip, 
            notifications: [...(trip.notifications || []), newNotification]
          }
        : trip
    ));
  };

  const markNotificationAsRead = (tripId: string, notificationId: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            notifications: trip.notifications?.map(notification => 
              notification.id === notificationId 
                ? { ...notification, read: true }
                : notification
            ) || []
          }
        : trip
    ));
  };

  // Real-time collaboration functions
  const addLiveNotification = (tripId: string, notificationData: Omit<LiveNotification, 'id' | 'timestamp'>) => {
    const newNotification: LiveNotification = {
      ...notificationData,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { 
            ...trip, 
            liveNotifications: [...(trip.liveNotifications || []), newNotification]
          }
        : trip
    ));
  };

  const dismissLiveNotification = (tripId: string, notificationId: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            liveNotifications: trip.liveNotifications?.filter(n => n.id !== notificationId) || []
          }
        : trip
    ));
  };

  const updateUserRole = (tripId: string, userId: string, role: 'viewer' | 'editor') => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            activeUsers: trip.activeUsers?.map(user => 
              user.userId === userId ? { ...user, role } : user
            ) || []
          }
        : trip
    ));
  };

  const removeCollaborator = (tripId: string, userId: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            collaborators: trip.collaborators.filter(id => id !== userId),
            activeUsers: trip.activeUsers?.filter(user => user.userId !== userId) || []
          }
        : trip
    ));

    addLiveNotification(tripId, {
      type: 'user_left',
      message: 'left the trip',
      userName: 'A user',
      autoHide: true
    });
  };

  const setNoteEditingUser = (tripId: string, noteId: string, userId: string | null) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            notes: trip.notes.map(note => 
              note.id === noteId 
                ? { 
                    ...note, 
                    editingUsers: userId ? [userId] : []
                  }
                : note
            )
          }
        : trip
    ));
  };

  // Budget Management Functions
  const initializeBudget = (tripId: string, totalBudget: number, currency: string) => {
    const defaultCategories: CategoryBudget[] = [
      { category: 'Accommodation', allocated: 0, spent: 0, color: '#3B82F6' },
      { category: 'Transportation', allocated: 0, spent: 0, color: '#10B981' },
      { category: 'Activities', allocated: 0, spent: 0, color: '#F59E0B' },
      { category: 'Food', allocated: 0, spent: 0, color: '#EF4444' },
      { category: 'Shopping', allocated: 0, spent: 0, color: '#8B5CF6' },
      { category: 'Other', allocated: 0, spent: 0, color: '#6B7280' }
    ];

    const newBudget: Budget = {
      totalBudget,
      currency,
      categoryBudgets: defaultCategories,
      expenses: [],
      settlements: [],
      payments: []
    };

    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, budget: newBudget } : trip
    ));
  };

  const addExpense = (tripId: string, expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.budget) return trip;

      const updatedBudget = { ...trip.budget };
      updatedBudget.expenses = [...updatedBudget.expenses, newExpense];
      
      const categoryIndex = updatedBudget.categoryBudgets.findIndex(
        cat => cat.category === newExpense.category
      );
      if (categoryIndex !== -1) {
        updatedBudget.categoryBudgets[categoryIndex].spent += newExpense.amount;
      }

      return { ...trip, budget: updatedBudget };
    }));

    addNotification(tripId, {
      type: 'expense_added',
      message: `New expense added: ${expenseData.description} ($${expenseData.amount})`,
      userId: expenseData.createdBy,
      userName: expenseData.createdBy,
      read: false
    });
  };

  const updateExpense = (tripId: string, expenseId: string, updates: Partial<Expense>) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.budget) return trip;

      const updatedBudget = { ...trip.budget };
      const expenseIndex = updatedBudget.expenses.findIndex(exp => exp.id === expenseId);
      
      if (expenseIndex !== -1) {
        const oldExpense = updatedBudget.expenses[expenseIndex];
        const updatedExpense = { ...oldExpense, ...updates };
        updatedBudget.expenses[expenseIndex] = updatedExpense;

        if (updates.amount !== undefined || updates.category !== undefined) {
          const oldCategoryIndex = updatedBudget.categoryBudgets.findIndex(
            cat => cat.category === oldExpense.category
          );
          if (oldCategoryIndex !== -1) {
            updatedBudget.categoryBudgets[oldCategoryIndex].spent -= oldExpense.amount;
          }

          const newCategoryIndex = updatedBudget.categoryBudgets.findIndex(
            cat => cat.category === updatedExpense.category
          );
          if (newCategoryIndex !== -1) {
            updatedBudget.categoryBudgets[newCategoryIndex].spent += updatedExpense.amount;
          }
        }
      }

      return { ...trip, budget: updatedBudget };
    }));
  };

  const deleteExpense = (tripId: string, expenseId: string) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.budget) return trip;

      const updatedBudget = { ...trip.budget };
      const expenseIndex = updatedBudget.expenses.findIndex(exp => exp.id === expenseId);
      
      if (expenseIndex !== -1) {
        const expense = updatedBudget.expenses[expenseIndex];
        
        const categoryIndex = updatedBudget.categoryBudgets.findIndex(
          cat => cat.category === expense.category
        );
        if (categoryIndex !== -1) {
          updatedBudget.categoryBudgets[categoryIndex].spent -= expense.amount;
        }

        updatedBudget.expenses = updatedBudget.expenses.filter(exp => exp.id !== expenseId);
      }

      return { ...trip, budget: updatedBudget };
    }));
  };

  const settleExpense = (tripId: string, expenseId: string, userId: string) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.budget) return trip;

      const updatedBudget = { ...trip.budget };
      const expenseIndex = updatedBudget.expenses.findIndex(exp => exp.id === expenseId);
      
      if (expenseIndex !== -1) {
        const expense = updatedBudget.expenses[expenseIndex];
        const splitIndex = expense.splitBetween.findIndex(split => split.userId === userId);
        
        if (splitIndex !== -1) {
          expense.splitBetween[splitIndex].isSettled = true;
          
          const allSettled = expense.splitBetween.every(split => split.isSettled);
          if (allSettled) {
            expense.isSettled = true;
          }
        }
      }

      return { ...trip, budget: updatedBudget };
    }));
  };

  const requestSettlement = (tripId: string, fromUserId: string, toUserId: string, amount: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip || !trip.budget) return;

    const newSettlement: Settlement = {
      id: crypto.randomUUID(),
      fromUserId,
      fromUserName: fromUserId,
      toUserId,
      toUserName: toUserId,
      amount,
      currency: trip.budget.currency,
      isSettled: false
    };

    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.budget) return trip;

      const updatedBudget = { ...trip.budget };
      updatedBudget.settlements = [...updatedBudget.settlements, newSettlement];

      return { ...trip, budget: updatedBudget };
    }));

    addNotification(tripId, {
      type: 'settlement_requested',
      message: `Settlement requested: $${amount}`,
      userId: fromUserId,
      userName: fromUserId,
      read: false
    });
  };

  const markSettlementPaid = (tripId: string, settlementId: string, paymentMethod: string) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.budget) return trip;

      const updatedBudget = { ...trip.budget };
      const settlementIndex = updatedBudget.settlements.findIndex(s => s.id === settlementId);
      
      if (settlementIndex !== -1) {
        updatedBudget.settlements[settlementIndex] = {
          ...updatedBudget.settlements[settlementIndex],
          isSettled: true,
          settledDate: new Date(),
          paymentMethod
        };
      }

      return { ...trip, budget: updatedBudget };
    }));
  };

  // Payment Functions
  const processPayment = (tripId: string, paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };

    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.budget) return trip;

      const updatedBudget = { ...trip.budget };
      updatedBudget.payments = [...(updatedBudget.payments || []), newPayment];

      // If payment is completed, update expense settlement status
      if (newPayment.status === 'completed' && newPayment.expenseId && newPayment.splitId) {
        const expenseIndex = updatedBudget.expenses.findIndex(exp => exp.id === newPayment.expenseId);
        if (expenseIndex !== -1) {
          const expense = updatedBudget.expenses[expenseIndex];
          const splitIndex = expense.splitBetween.findIndex(split => split.userId === newPayment.splitId);
          if (splitIndex !== -1) {
            expense.splitBetween[splitIndex].isSettled = true;
            
            // Check if all splits are settled
            const allSettled = expense.splitBetween.every(split => split.isSettled);
            if (allSettled) {
              expense.isSettled = true;
            }
          }
        }
      }

      return { ...trip, budget: updatedBudget };
    }));

    // Add notification
    addNotification(tripId, {
      type: newPayment.status === 'completed' ? 'payment_completed' : 'payment_failed',
      message: newPayment.status === 'completed' 
        ? `Payment of ${newPayment.currency} ${newPayment.amount} completed`
        : `Payment of ${newPayment.currency} ${newPayment.amount} failed`,
      userId: newPayment.fromUserId,
      userName: newPayment.fromUserName,
      read: false
    });

    // Add live notification for successful payments
    if (newPayment.status === 'completed') {
      addLiveNotification(tripId, {
        type: 'payment_completed',
        message: `completed a payment of ${newPayment.currency} ${newPayment.amount}`,
        userName: newPayment.fromUserName,
        autoHide: true
      });
    }
  };

  const setPaymentDeadline = (tripId: string, deadline: Date) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.budget) return trip;

      const updatedBudget = { ...trip.budget };
      updatedBudget.paymentDeadline = deadline;
      updatedBudget.reminderSettings = {
        enabled: true,
        daysBefore: 3
      };

      return { ...trip, budget: updatedBudget };
    }));

    addNotification(tripId, {
      type: 'payment_reminder',
      message: `Payment deadline set for ${deadline.toLocaleDateString()}`,
      userId: 'admin',
      userName: 'Admin',
      read: false
    });
  };

  const sendPaymentReminder = (tripId: string, userId: string) => {
    addNotification(tripId, {
      type: 'payment_reminder',
      message: 'Reminder: You have outstanding payments to settle',
      userId,
      userName: 'System',
      read: false
    });
  };

  // Sustainability Functions
  const initializeSustainability = (tripId: string) => {
    const defaultSustainability: SustainabilityData = {
      carbon_footprint: {
        transport: 0,
        accommodation: 0,
        food: 0,
        activities: 0,
        total: 0,
        treeEquivalent: 0
      },
      transportOptions: [],
      accommodationOptions: [],
      offsetProjects: [
        {
          id: crypto.randomUUID(),
          name: 'Global Forest Restoration',
          type: 'forest',
          description: 'Supporting reforestation efforts worldwide to combat climate change',
          image: 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?auto=compress&cs=tinysrgb&w=800',
          costPerTon: 22,
          location: 'Global',
          impact: '1M+ trees planted',
          certification: 'Gold Standard',
          totalOffset: 5000
        },
        {
          id: crypto.randomUUID(),
          name: 'Renewable Energy Development',
          type: 'renewable',
          description: 'Funding solar and wind energy projects in developing countries',
          image: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=800',
          costPerTon: 18,
          location: 'Global',
          impact: '50 MW clean energy',
          certification: 'VCS',
          totalOffset: 8500
        }
      ],
      offsetContributions: [],
      sustainabilityGoals: [],
      pastTripsComparison: []
    };

    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, sustainability: defaultSustainability } : trip
    ));
  };

  const updateCarbonFootprint = (tripId: string, footprint: Partial<CarbonFootprint>) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.sustainability) return trip;

      const updatedSustainability = { ...trip.sustainability };
      updatedSustainability.carbon_footprint = { 
        ...updatedSustainability.carbon_footprint, 
        ...footprint 
      };
      
      // Recalculate total and tree equivalent
      const total = updatedSustainability.carbon_footprint.transport + 
                   updatedSustainability.carbon_footprint.accommodation + 
                   updatedSustainability.carbon_footprint.food + 
                   updatedSustainability.carbon_footprint.activities;
      
      updatedSustainability.carbon_footprint.total = total;
      updatedSustainability.carbon_footprint.treeEquivalent = Math.round(total / 22); // 22kg CO2 per tree per year

      return { ...trip, sustainability: updatedSustainability };
    }));
  };

  const addTransportOption = (tripId: string, option: TransportOption) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.sustainability) return trip;

      const updatedSustainability = { ...trip.sustainability };
      updatedSustainability.transportOptions = [...updatedSustainability.transportOptions, option];

      return { ...trip, sustainability: updatedSustainability };
    }));
  };

  const selectTransportOption = (tripId: string, optionId: string) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.sustainability) return trip;

      const selectedOption = trip.sustainability.transportOptions.find(opt => opt.id === optionId);
      if (!selectedOption) return trip;

      const updatedSustainability = { ...trip.sustainability };
      updatedSustainability.carbon_footprint.transport = selectedOption.totalCarbon;
      
      // Recalculate total
      const total = updatedSustainability.carbon_footprint.transport + 
                   updatedSustainability.carbon_footprint.accommodation + 
                   updatedSustainability.carbon_footprint.food + 
                   updatedSustainability.carbon_footprint.activities;
      
      updatedSustainability.carbon_footprint.total = total;
      updatedSustainability.carbon_footprint.treeEquivalent = Math.round(total / 22);

      return { ...trip, sustainability: updatedSustainability };
    }));
  };

  const addOffsetContribution = (tripId: string, contribution: Omit<OffsetContribution, 'id' | 'date'>) => {
    const newContribution: OffsetContribution = {
      ...contribution,
      id: crypto.randomUUID(),
      date: new Date()
    };

    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.sustainability) return trip;

      const updatedSustainability = { ...trip.sustainability };
      updatedSustainability.offsetContributions = [...updatedSustainability.offsetContributions, newContribution];

      return { ...trip, sustainability: updatedSustainability };
    }));
  };

  const updateSustainabilityGoal = (tripId: string, goalId: string, progress: number) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.sustainability) return trip;

      const updatedSustainability = { ...trip.sustainability };
      updatedSustainability.sustainabilityGoals = updatedSustainability.sustainabilityGoals.map(goal =>
        goal.id === goalId ? { ...goal, current: progress } : goal
      );

      return { ...trip, sustainability: updatedSustainability };
    }));
  };

  // Smart Pak Functions
  const initializePackingList = (tripId: string) => {
    const defaultPackingList: PackingList = {
      id: crypto.randomUUID(),
      tripId,
      items: [],
      luggageType: 'carry-on',
      totalWeight: 0,
      totalVolume: 0,
      lastUpdated: new Date()
    };

    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, packingList: defaultPackingList } : trip
    ));
  };

  const addPackingItem = (tripId: string, itemData: Omit<PackingItem, 'id' | 'timestamp'>) => {
    const newItem: PackingItem = {
      ...itemData,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;

      if (!trip.packingList) {
        // Initialize packing list if it doesn't exist
        const newPackingList: PackingList = {
          id: crypto.randomUUID(),
          tripId,
          items: [newItem],
          luggageType: 'carry-on',
          totalWeight: newItem.weight * newItem.quantity,
          totalVolume: newItem.volume * newItem.quantity,
          lastUpdated: new Date()
        };
        return { ...trip, packingList: newPackingList };
      }

      const updatedItems = [...trip.packingList.items, newItem];
      const totalWeight = updatedItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      const totalVolume = updatedItems.reduce((sum, item) => sum + (item.volume * item.quantity), 0);

      return {
        ...trip,
        packingList: {
          ...trip.packingList,
          items: updatedItems,
          totalWeight,
          totalVolume,
          lastUpdated: new Date()
        }
      };
    }));

    addNotification(tripId, {
      type: 'packing_item_added',
      message: `${itemData.lastUpdatedBy || 'Someone'} added "${itemData.name}" to packing list`,
      userId: itemData.assignedTo || '',
      userName: itemData.lastUpdatedBy || 'Someone',
      read: false
    });
  };

  const updatePackingItem = (tripId: string, itemId: string, updates: Partial<PackingItem>) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.packingList) return trip;

      const updatedItems = trip.packingList.items.map(item =>
        item.id === itemId ? { ...item, ...updates, timestamp: new Date() } : item
      );

      const totalWeight = updatedItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      const totalVolume = updatedItems.reduce((sum, item) => sum + (item.volume * item.quantity), 0);

      return {
        ...trip,
        packingList: {
          ...trip.packingList,
          items: updatedItems,
          totalWeight,
          totalVolume,
          lastUpdated: new Date()
        }
      };
    }));

    if (updates.lastUpdatedBy) {
      addNotification(tripId, {
        type: 'packing_item_updated',
        message: `${updates.lastUpdatedBy} updated a packing item`,
        userId: updates.assignedTo || '',
        userName: updates.lastUpdatedBy,
        read: false
      });
    }
  };

  const deletePackingItem = (tripId: string, itemId: string) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.packingList) return trip;

      const updatedItems = trip.packingList.items.filter(item => item.id !== itemId);
      const totalWeight = updatedItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      const totalVolume = updatedItems.reduce((sum, item) => sum + (item.volume * item.quantity), 0);

      return {
        ...trip,
        packingList: {
          ...trip.packingList,
          items: updatedItems,
          totalWeight,
          totalVolume,
          lastUpdated: new Date()
        }
      };
    }));
  };

  const togglePackingItemStatus = (tripId: string, itemId: string, status: 'packed' | 'purchased' | 'missing') => {
    updatePackingItem(tripId, itemId, { status });
  };

  const assignPackingItem = (tripId: string, itemId: string, userId: string) => {
    updatePackingItem(tripId, itemId, { assignedTo: userId });
  };

  const updateLuggageType = (tripId: string, luggageType: 'carry-on' | 'checked' | 'personal') => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId || !trip.packingList) return trip;

      return {
        ...trip,
        packingList: {
          ...trip.packingList,
          luggageType,
          lastUpdated: new Date()
        }
      };
    }));
  };

  return (
    <AppContext.Provider value={{
      trips,
      chats,
      forumPosts,
      activeTrip,
      createTrip,
      updateTrip,
      setActiveTrip,
      addStickyNote,
      updateStickyNote,
      deleteStickyNote,
      sendMessage,
      createForumPost,
      addForumComment,
      joinTripByInvite,
      updateUserActivity,
      addNotification,
      markNotificationAsRead,
      initializeBudget,
      addExpense,
      updateExpense,
      deleteExpense,
      settleExpense,
      requestSettlement,
      markSettlementPaid,
      processPayment,
      setPaymentDeadline,
      sendPaymentReminder,
      initializeSustainability,
      updateCarbonFootprint,
      addTransportOption,
      selectTransportOption,
      addOffsetContribution,
      updateSustainabilityGoal,
      initializePackingList,
      addPackingItem,
      updatePackingItem,
      deletePackingItem,
      togglePackingItemStatus,
      assignPackingItem,
      updateLuggageType,
      addLiveNotification,
      dismissLiveNotification,
      updateUserRole,
      removeCollaborator,
      setNoteEditingUser
    }}>
      {children}
    </AppContext.Provider>
  );
};