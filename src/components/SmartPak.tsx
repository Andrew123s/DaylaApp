import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  User, 
  Weight, 
  Ruler,
  ShoppingCart,
  AlertCircle,
  Filter,
  Search,
  Download,
  Upload,
  Zap,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useDatabase } from '../hooks/useSupabase';

interface SmartPakProps {
  tripId: string;
}

const SmartPak: React.FC<SmartPakProps> = ({ tripId }) => {
  const { trips, initializePackingList, addPackingItem, updatePackingItem, deletePackingItem, togglePackingItemStatus, assignPackingItem, updateLuggageType } = useApp();
  const { user } = useAuth();
  const { createPackingList, addPackingItem: addItemToSupabase, getPackingItems } = useDatabase();
  const [showAddItem, setShowAddItem] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [packingItems, setPackingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const trip = trips.find(t => t.id === tripId);
  const packingList = trip?.packingList;

  useEffect(() => {
    loadPackingItems();
  }, [tripId, packingList?.id]);

  const loadPackingItems = async () => {
    if (!packingList?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const items = await getPackingItems(packingList.id);
      setPackingItems(items);
    } catch (error) {
      console.error('Error loading packing items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!trip) return null;

  if (!packingList) {
    return <PackingSetup tripId={tripId} onSetup={async () => {
      try {
        const newPackingList = await createPackingList(tripId);
        initializePackingList(tripId, newPackingList);
      } catch (error) {
        console.error('Error creating packing list:', error);
      }
    }} />;
  }

  const categories = ['Clothing', 'Electronics', 'Toiletries', 'Documents', 'Health & Safety', 'Entertainment', 'Food & Snacks', 'Sports & Activities', 'Other'];
  
  const filteredItems = packingItems.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    const assigneeMatch = filterAssignee === 'all' || item.assigned_to === filterAssignee;
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && statusMatch && assigneeMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'packed': return 'bg-green-100 text-green-800';
      case 'purchased': return 'bg-blue-100 text-blue-800';
      case 'missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'text-red-600';
      case 'recommended': return 'text-yellow-600';
      case 'optional': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getWeightLimitForLuggage = (type: string) => {
    switch (type) {
      case 'carry-on': return 7000; // 7kg
      case 'checked': return 23000; // 23kg
      case 'personal': return 2000; // 2kg
      default: return 7000;
    }
  };

  const weightLimit = getWeightLimitForLuggage(packingList.luggageType);
  const totalWeight = packingItems.reduce((sum, item) => sum + (item.weight_grams * item.quantity), 0);
  const weightPercentage = (totalWeight / weightLimit) * 100;

  const packedItems = packingItems.filter(item => item.status === 'packed').length;
  const totalItems = packingItems.length;
  const packingProgress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  const handleAddItem = async (itemData: any) => {
    try {
      await addItemToSupabase(packingList.id, itemData);
      addPackingItem(tripId, itemData);
      await loadPackingItems();
      setShowAddItem(false);
    } catch (error) {
      console.error('Error adding packing item:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Packing Progress */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-gray-900">
              {packingProgress.toFixed(0)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${packingProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              {packedItems} of {totalItems} items packed
            </div>
          </div>
        </div>

        {/* Weight Tracking */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weight</h3>
            <Weight className="h-6 w-6 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-gray-900">
              {(totalWeight / 1000).toFixed(1)}kg
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  weightPercentage > 90 ? 'bg-red-500' : 
                  weightPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(weightPercentage, 100)}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              Limit: {(weightLimit / 1000).toFixed(0)}kg ({packingList.luggageType})
            </div>
          </div>
        </div>

        {/* Volume Tracking */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Volume</h3>
            <Ruler className="h-6 w-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-gray-900">
              {(packingItems.reduce((sum, item) => sum + (item.volume_cm3 * item.quantity), 0) / 1000).toFixed(1)}L
            </div>
            <div className="text-sm text-gray-600">
              Total volume used
            </div>
          </div>
        </div>

        {/* Luggage Type */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Luggage</h3>
            <Package className="h-6 w-6 text-orange-600" />
          </div>
          <div className="space-y-3">
            <select
              value={packingList.luggageType}
              onChange={(e) => updateLuggageType(tripId, e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="carry-on">Carry-on (7kg)</option>
              <option value="checked">Checked (23kg)</option>
              <option value="personal">Personal (2kg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>

          <button
            onClick={() => setShowSuggestions(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Zap className="h-4 w-4" />
            <span>Smart Suggestions</span>
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="packed">Packed</option>
            <option value="purchased">Purchased</option>
            <option value="missing">Missing</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Packing Items</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading packing items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
              <p className="text-gray-600 mb-4">Start building your packing list</p>
              <button
                onClick={() => setShowAddItem(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Item
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <PackingItem
                key={item.id}
                item={item}
                tripId={tripId}
                isEditing={editingItem === item.id}
                onEdit={() => setEditingItem(item.id)}
                onCancelEdit={() => setEditingItem(null)}
                onSave={async (updates) => {
                  await updatePackingItem(tripId, item.id, { ...updates, last_updated_by: user?.name });
                  await loadPackingItems();
                  setEditingItem(null);
                }}
                onDelete={async () => {
                  await deletePackingItem(tripId, item.id);
                  await loadPackingItems();
                }}
                onToggleStatus={async (status) => {
                  await togglePackingItemStatus(tripId, item.id, status);
                  await loadPackingItems();
                }}
                onAssign={async (userId) => {
                  await assignPackingItem(tripId, item.id, userId);
                  await loadPackingItems();
                }}
                collaborators={trip.collaborators}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal
          tripId={tripId}
          categories={categories}
          collaborators={trip.collaborators}
          onClose={() => setShowAddItem(false)}
          onAdd={handleAddItem}
        />
      )}

      {/* Smart Suggestions Modal */}
      {showSuggestions && (
        <SmartSuggestionsModal
          tripId={tripId}
          trip={trip}
          onClose={() => setShowSuggestions(false)}
          onAddItems={(items) => {
            items.forEach(async (item) => {
              await handleAddItem({ ...item, last_updated_by: user?.name });
            });
            setShowSuggestions(false);
          }}
        />
      )}
    </div>
  );
};

// Packing Setup Component
const PackingSetup: React.FC<{ tripId: string; onSetup: () => void }> = ({ tripId, onSetup }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-sm text-center">
      <Package className="h-16 w-16 text-blue-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Pak - Intelligent Packing</h2>
      <p className="text-gray-600 mb-8">
        Create smart packing lists with AI-powered suggestions, weight tracking, and collaborative features.
      </p>
      
      <button
        onClick={onSetup}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
      >
        Start Smart Packing
      </button>
    </div>
  );
};

// Packing Item Component
interface PackingItemProps {
  item: any;
  tripId: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updates: any) => void;
  onDelete: () => void;
  onToggleStatus: (status: 'packed' | 'purchased' | 'missing') => void;
  onAssign: (userId: string) => void;
  collaborators: string[];
}

const PackingItem: React.FC<PackingItemProps> = ({
  item,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onToggleStatus,
  onAssign,
  collaborators
}) => {
  const { user } = useAuth();
  const [editData, setEditData] = useState({
    name: item.name,
    category: item.category,
    quantity: item.quantity.toString(),
    weight: (item.weight_grams / 1000).toString(), // Convert to kg for display
    volume: (item.volume_cm3 / 1000).toString(), // Convert to L for display
    priority: item.priority,
    notes: item.notes || ''
  });

  if (isEditing) {
    return (
      <div className="p-6 bg-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Item name"
          />
          <select
            value={editData.category}
            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Clothing">Clothing</option>
            <option value="Electronics">Electronics</option>
            <option value="Toiletries">Toiletries</option>
            <option value="Documents">Documents</option>
            <option value="Health & Safety">Health & Safety</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Food & Snacks">Food & Snacks</option>
            <option value="Sports & Activities">Sports & Activities</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number"
            value={editData.quantity}
            onChange={(e) => setEditData(prev => ({ ...prev, quantity: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Quantity"
            min="1"
          />
          <input
            type="number"
            step="0.1"
            value={editData.weight}
            onChange={(e) => setEditData(prev => ({ ...prev, weight: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Weight (kg)"
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onCancelEdit}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({
              name: editData.name,
              category: editData.category,
              quantity: parseInt(editData.quantity),
              weight_grams: Math.round(parseFloat(editData.weight) * 1000), // Convert back to grams
              volume_cm3: Math.round(parseFloat(editData.volume) * 1000), // Convert back to cm3
              priority: editData.priority,
              notes: editData.notes
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onToggleStatus(
              item.status === 'packed' ? 'missing' : 
              item.status === 'purchased' ? 'packed' : 'purchased'
            )}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              item.status === 'packed' 
                ? 'bg-green-500 border-green-500 text-white' 
                : item.status === 'purchased'
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {(item.status === 'packed' || item.status === 'purchased') && (
              <Check className="h-3 w-3" />
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
              <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>{item.category}</span>
              <span>Qty: {item.quantity}</span>
              <span>{(item.weight_grams / 1000).toFixed(1)}kg</span>
              {item.assigned_to && (
                <span className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>Assigned</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Item Modal Component
interface AddItemModalProps {
  tripId: string;
  categories: string[];
  collaborators: string[];
  onClose: () => void;
  onAdd: (item: any) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  categories,
  collaborators,
  onClose,
  onAdd
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0],
    quantity: 1,
    weight_grams: 0, // in grams
    volume_cm3: 0, // in cm3
    priority: 'recommended' as 'essential' | 'recommended' | 'optional',
    assigned_to: user?.id || '',
    is_shared: false,
    weather_dependent: false,
    activity_specific: [] as string[],
    notes: '',
    estimated_cost: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const item = {
      name: formData.name,
      category: formData.category,
      quantity: formData.quantity,
      weight_grams: formData.weight_grams,
      volume_cm3: formData.volume_cm3,
      status: 'missing' as const,
      assigned_to: formData.assigned_to,
      is_shared: formData.is_shared,
      priority: formData.priority,
      weather_dependent: formData.weather_dependent,
      activity_specific: formData.activity_specific,
      notes: formData.notes,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
      last_updated_by: user?.name
    };

    onAdd(item);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Packing Item</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter item name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (grams)
              </label>
              <input
                type="number"
                value={formData.weight_grams}
                onChange={(e) => setFormData(prev => ({ ...prev, weight_grams: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="essential">Essential</option>
                <option value="recommended">Recommended</option>
                <option value="optional">Optional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Any special notes about this item..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Smart Suggestions Modal Component
interface SmartSuggestionsModalProps {
  tripId: string;
  trip: any;
  onClose: () => void;
  onAddItems: (items: any[]) => void;
}

const SmartSuggestionsModal: React.FC<SmartSuggestionsModalProps> = ({
  trip,
  onClose,
  onAddItems
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Generate smart suggestions based on trip details
  const generateSuggestions = () => {
    const suggestions = [];
    
    // Basic essentials
    suggestions.push(
      { name: 'Passport', category: 'Documents', weight_grams: 50, volume_cm3: 100, priority: 'essential' },
      { name: 'Phone Charger', category: 'Electronics', weight_grams: 200, volume_cm3: 300, priority: 'essential' },
      { name: 'Toothbrush', category: 'Toiletries', weight_grams: 30, volume_cm3: 50, priority: 'essential' },
      { name: 'Underwear (3 pairs)', category: 'Clothing', weight_grams: 150, volume_cm3: 300, priority: 'essential' }
    );

    // Weather-based suggestions
    const startMonth = new Date(trip.startDate).getMonth();
    if (startMonth >= 11 || startMonth <= 2) { // Winter months
      suggestions.push(
        { name: 'Winter Jacket', category: 'Clothing', weight_grams: 800, volume_cm3: 3000, priority: 'essential' },
        { name: 'Warm Socks', category: 'Clothing', weight_grams: 100, volume_cm3: 200, priority: 'recommended' },
        { name: 'Gloves', category: 'Clothing', weight_grams: 80, volume_cm3: 150, priority: 'recommended' }
      );
    } else if (startMonth >= 6 && startMonth <= 8) { // Summer months
      suggestions.push(
        { name: 'Sunscreen', category: 'Toiletries', weight_grams: 100, volume_cm3: 150, priority: 'essential' },
        { name: 'Sunglasses', category: 'Other', weight_grams: 50, volume_cm3: 100, priority: 'recommended' },
        { name: 'Swimwear', category: 'Clothing', weight_grams: 150, volume_cm3: 200, priority: 'recommended' }
      );
    }

    // Trip duration based
    const tripDays = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24));
    if (tripDays > 7) {
      suggestions.push(
        { name: 'Laundry Detergent Pods', category: 'Toiletries', weight_grams: 50, volume_cm3: 100, priority: 'recommended' },
        { name: 'Extra Phone Battery', category: 'Electronics', weight_grams: 300, volume_cm3: 200, priority: 'recommended' }
      );
    }

    return suggestions.map((item, index) => ({
      id: `suggestion-${index}`,
      ...item,
      quantity: 1,
      status: 'missing',
      is_shared: false,
      weather_dependent: item.name.includes('Winter') || item.name.includes('Sun'),
      activity_specific: []
    }));
  };

  const suggestions = generateSuggestions();

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleAddSelected = () => {
    const itemsToAdd = suggestions.filter(item => selectedItems.includes(item.id));
    onAddItems(itemsToAdd);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Smart Suggestions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Based on your trip to <strong>{trip.title}</strong> from {new Date(trip.startDate).toLocaleDateString()} 
          to {new Date(trip.endDate).toLocaleDateString()}, here are some smart packing suggestions:
        </p>

        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedItems.includes(item.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedItems.includes(item.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedItems.includes(item.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span>{item.category}</span>
                      <span>{(item.weight_grams / 1000).toFixed(1)}kg</span>
                      <span className={`font-medium ${
                        item.priority === 'essential' ? 'text-red-600' :
                        item.priority === 'recommended' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedItems.length === 0}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add {selectedItems.length} Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartPak;