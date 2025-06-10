import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  PieChart, 
  Plus, 
  Filter, 
  Calendar,
  MapPin,
  User,
  Users,
  Receipt,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Camera,
  Percent,
  Hash,
  Clock,
  X,
  Shield,
  Lock,
  Apple,
  Smartphone
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { usePayments, useDatabase } from '../hooks/useSupabase';
import { format } from 'date-fns';

interface BudgetDashboardProps {
  tripId: string;
}

const BudgetDashboard: React.FC<BudgetDashboardProps> = ({ tripId }) => {
  const { trips, addExpense, updateExpense, deleteExpense, settleExpense, initializeBudget } = useApp();
  const { user } = useAuth();
  const { processPayment, paymentHistory, isProcessing } = usePayments(tripId);
  const { getExpenses, createBudget } = useDatabase();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPerson, setFilterPerson] = useState('all');
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const trip = trips.find(t => t.id === tripId);
  const budget = trip?.budget;

  useEffect(() => {
    loadExpenses();
  }, [tripId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const expenseData = await getExpenses(tripId);
      setExpenses(expenseData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!trip) return null;

  if (!budget) {
    return <BudgetSetup tripId={tripId} onSetup={() => setShowBudgetSetup(false)} />;
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = budget.totalBudget - totalSpent;
  const spentPercentage = (totalSpent / budget.totalBudget) * 100;

  const filteredExpenses = expenses.filter(expense => {
    const categoryMatch = filterCategory === 'all' || expense.category === filterCategory;
    const personMatch = filterPerson === 'all' || expense.paid_by === filterPerson;
    return categoryMatch && personMatch;
  });

  const categories = ['Accommodation', 'Transportation', 'Activities', 'Food', 'Shopping', 'Other'];
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  const handlePayment = async (amount: number, description: string, expenseId?: string, splitId?: string) => {
    try {
      const result = await processPayment({
        amount,
        currency: budget.currency,
        description,
        paymentMethod: 'card', // This would come from payment modal
        expenseId,
        splitId,
        toUserId: null // For expense settlements
      });

      if (result.success) {
        // Refresh expenses to show updated settlement status
        await loadExpenses();
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = 'Payment processed successfully!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Payment failed. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    try {
      await addExpense(tripId, expenseData);
      await loadExpenses(); // Refresh the list
      setShowAddExpense(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Budget Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Budget</h3>
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-gray-900">
              {budget.currency} {budget.totalBudget.toLocaleString()}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  spentPercentage > 90 ? 'bg-red-500' : 
                  spentPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Spent: {budget.currency} {totalSpent.toLocaleString()}
              </span>
              <span className={`font-medium ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Remaining: {budget.currency} {remainingBudget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Breakdown Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">By Category</h3>
            <PieChart className="h-6 w-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            {budget.categoryBudgets.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-700">{category.category}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {budget.currency} {category.spent.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Per Person Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Per Person</h3>
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div className="space-y-3">
            {trip.collaborators.map((collaboratorId, index) => {
              const userExpenses = expenses.filter(exp => exp.paid_by === collaboratorId);
              const totalPaid = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
              const totalOwed = expenses.reduce((sum, exp) => {
                const split = exp.expense_splits?.find((s: any) => s.user_id === collaboratorId);
                return sum + (split ? split.amount : 0);
              }, 0);
              
              return (
                <div key={collaboratorId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2"
                      alt="User"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-700">
                      {index === 0 ? user?.name : `User ${index + 1}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      Paid: {budget.currency} {totalPaid.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Owes: {budget.currency} {totalOwed.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
          
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
            value={filterPerson}
            onChange={(e) => setFilterPerson(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All People</option>
            {trip.collaborators.map((collaboratorId, index) => (
              <option key={collaboratorId} value={collaboratorId}>
                {index === 0 ? user?.name : `User ${index + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {filteredExpenses.length} of {expenses.length} expenses
          </span>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your trip expenses</p>
              <button
                onClick={() => setShowAddExpense(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Expense
              </button>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                tripId={tripId}
                isEditing={editingExpense === expense.id}
                onEdit={() => setEditingExpense(expense.id)}
                onCancelEdit={() => setEditingExpense(null)}
                onSave={async (updates) => {
                  await updateExpense(tripId, expense.id, updates);
                  await loadExpenses();
                  setEditingExpense(null);
                }}
                onDelete={async () => {
                  await deleteExpense(tripId, expense.id);
                  await loadExpenses();
                }}
                onSettle={(userId) => settleExpense(tripId, expense.id, userId)}
                onPayment={handlePayment}
                currency={budget.currency}
                collaborators={trip.collaborators}
                isProcessingPayment={isProcessing}
              />
            ))
          )}
        </div>
      </div>

      {/* Settlement Center */}
      <SettlementCenter 
        tripId={tripId} 
        expenses={expenses}
        budget={budget}
        onPayment={handlePayment}
        paymentHistory={paymentHistory}
      />

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          tripId={tripId}
          currency={budget.currency}
          categories={categories}
          collaborators={trip.collaborators}
          onClose={() => setShowAddExpense(false)}
          onAdd={handleAddExpense}
        />
      )}
    </div>
  );
};

// Budget Setup Component
const BudgetSetup: React.FC<{ tripId: string; onSetup: () => void }> = ({ tripId, onSetup }) => {
  const { initializeBudget } = useApp();
  const { createBudget } = useDatabase();
  const [totalBudget, setTotalBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (totalBudget && parseFloat(totalBudget) > 0) {
      setLoading(true);
      try {
        await createBudget(tripId, {
          total_budget: parseFloat(totalBudget),
          currency
        });
        initializeBudget(tripId, parseFloat(totalBudget), currency);
        onSetup();
      } catch (error) {
        console.error('Error setting up budget:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-sm text-center">
      <DollarSign className="h-16 w-16 text-blue-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Set Up Your Trip Budget</h2>
      <p className="text-gray-600 mb-8">
        Start tracking expenses by setting your total trip budget and currency.
      </p>
      
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Budget
          </label>
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            placeholder="Enter total budget"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="JPY">JPY - Japanese Yen</option>
          </select>
        </div>
        
        <button
          onClick={handleSetup}
          disabled={!totalBudget || parseFloat(totalBudget) <= 0 || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? 'Setting up...' : 'Set Up Budget'}
        </button>
      </div>
    </div>
  );
};

// Expense Item Component (updated to work with Supabase data)
interface ExpenseItemProps {
  expense: any;
  tripId: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updates: any) => void;
  onDelete: () => void;
  onSettle: (userId: string) => void;
  onPayment: (amount: number, description: string, expenseId?: string, splitId?: string) => void;
  currency: string;
  collaborators: string[];
  isProcessingPayment: boolean;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onSettle,
  onPayment,
  currency,
  collaborators,
  isProcessingPayment
}) => {
  const { user } = useAuth();
  const [editData, setEditData] = useState({
    amount: expense.amount.toString(),
    description: expense.description,
    category: expense.category
  });

  const categoryColors: { [key: string]: string } = {
    'Accommodation': '#3B82F6',
    'Transportation': '#10B981',
    'Activities': '#F59E0B',
    'Food': '#EF4444',
    'Shopping': '#8B5CF6',
    'Other': '#6B7280'
  };

  if (isEditing) {
    return (
      <div className="p-6 bg-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            value={editData.amount}
            onChange={(e) => setEditData(prev => ({ ...prev, amount: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Amount"
          />
          <input
            type="text"
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description"
          />
          <select
            value={editData.category}
            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Accommodation">Accommodation</option>
            <option value="Transportation">Transportation</option>
            <option value="Activities">Activities</option>
            <option value="Food">Food</option>
            <option value="Shopping">Shopping</option>
            <option value="Other">Other</option>
          </select>
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
              amount: parseFloat(editData.amount),
              description: editData.description,
              category: editData.category
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
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: categoryColors[expense.category] || '#6B7280' }}
          />
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{expense.description}</h4>
              {expense.receipt_image_url && (
                <Camera className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(expense.expense_date), 'MMM dd, yyyy')}</span>
              </span>
              {expense.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{expense.location}</span>
                </span>
              )}
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {expense.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {currency} {expense.amount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Split {expense.expense_splits?.length || 1} ways
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {expense.is_settled ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            
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

      {/* Split Details with Individual Pay Buttons */}
      {expense.expense_splits && expense.expense_splits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Split between:</span>
            <div className="flex -space-x-2">
              {expense.expense_splits.map((split: any, index: number) => (
                <div
                  key={split.id}
                  className={`relative w-8 h-8 rounded-full border-2 border-white ${
                    split.is_settled ? 'opacity-100' : 'opacity-60'
                  }`}
                  title={`${split.user_profiles?.name || 'User'}: ${currency} ${split.amount} ${split.is_settled ? '(Settled)' : '(Pending)'}`}
                >
                  <img
                    src={split.user_profiles?.avatar_url || "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2"}
                    alt={split.user_profiles?.name || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {split.is_settled && (
                    <CheckCircle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 bg-white rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Individual Split Details with Pay Buttons */}
          <div className="space-y-2">
            {expense.expense_splits.map((split: any) => (
              <div key={split.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={split.user_profiles?.avatar_url || "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=24&h=24&dpr=2"}
                    alt={split.user_profiles?.name || 'User'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-900">{split.user_profiles?.name || 'User'}</span>
                  <span className="text-sm text-gray-600">
                    {currency} {split.amount.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {split.is_settled ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Paid ✓
                    </span>
                  ) : split.user_id === user?.id ? (
                    <button
                      onClick={() => onPayment(split.amount, `Payment for ${expense.description}`, expense.id, split.id)}
                      disabled={isProcessingPayment}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isProcessingPayment ? 'Processing...' : `Pay ${currency} ${split.amount.toFixed(2)}`}
                    </button>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mark as Settled Button */}
          {!expense.is_settled && user && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => onSettle(user.id)}
                className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
              >
                Mark as Settled
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add Expense Modal Component (updated for Supabase)
interface AddExpenseModalProps {
  tripId: string;
  currency: string;
  categories: string[];
  collaborators: string[];
  onClose: () => void;
  onAdd: (expense: any) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  currency,
  categories,
  collaborators,
  onClose,
  onAdd
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: categories[0],
    date: new Date().toISOString().split('T')[0],
    location: '',
    paidBy: user?.id || '',
    splitType: 'equal' as 'equal' | 'percentage' | 'custom',
    splitBetween: collaborators.map(id => ({ userId: id, amount: 0, isSelected: true }))
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const selectedSplits = formData.splitBetween.filter(split => split.isSelected);
    const amount = parseFloat(formData.amount);
    
    let splitAmounts;
    if (formData.splitType === 'equal') {
      const splitAmount = amount / selectedSplits.length;
      splitAmounts = selectedSplits.map(split => ({
        user_id: split.userId,
        amount: splitAmount,
        is_settled: split.userId === formData.paidBy
      }));
    } else {
      splitAmounts = selectedSplits.map(split => ({
        user_id: split.userId,
        amount: split.amount,
        is_settled: split.userId === formData.paidBy
      }));
    }

    const expense = {
      amount,
      currency,
      category: formData.category,
      description: formData.description,
      expense_date: formData.date,
      location: formData.location,
      paid_by: formData.paidBy,
      is_settled: splitAmounts.every(split => split.is_settled),
      expense_splits: splitAmounts
    };

    onAdd(expense);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
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
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What was this expense for?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Where was this expense?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paid By
            </label>
            <select
              value={formData.paidBy}
              onChange={(e) => setFormData(prev => ({ ...prev, paidBy: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {collaborators.map((collaboratorId, index) => (
                <option key={collaboratorId} value={collaboratorId}>
                  {collaboratorId === user?.id ? user.name : `User ${index + 1}`}
                </option>
              ))}
            </select>
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
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Settlement Center Component (updated for Supabase)
const SettlementCenter: React.FC<{ 
  tripId: string; 
  expenses: any[];
  budget: any;
  onPayment: (amount: number, description: string) => void;
  paymentHistory: any[];
}> = ({ expenses, budget, onPayment, paymentHistory }) => {
  const { user } = useAuth();

  if (!budget || !user) return null;

  // Calculate who owes whom based on Supabase expense data
  const balances: { [userId: string]: number } = {};
  
  expenses.forEach(expense => {
    if (expense.expense_splits) {
      expense.expense_splits.forEach((split: any) => {
        if (!split.is_settled) {
          balances[split.user_id] = (balances[split.user_id] || 0) - split.amount;
          balances[expense.paid_by] = (balances[expense.paid_by] || 0) + split.amount;
        }
      });
    }
  });

  const settlements = Object.entries(balances)
    .filter(([_, amount]) => Math.abs(amount) > 0.01)
    .map(([userId, amount]) => ({
      userId,
      amount,
      owes: amount < 0,
      userName: userId === user.id ? user.name : `User ${userId.slice(-4)}`
    }));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Settlement Center</h3>
        <CreditCard className="h-6 w-6 text-green-600" />
      </div>

      {settlements.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All settled up!</h3>
          <p className="text-gray-600">Everyone's expenses are balanced.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {settlements.map((settlement) => (
            <div
              key={settlement.userId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2"
                  alt={settlement.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-gray-900">{settlement.userName}</div>
                  <div className={`text-sm ${settlement.owes ? 'text-red-600' : 'text-green-600'}`}>
                    {settlement.owes ? 'Owes' : 'Is owed'} {budget.currency} {Math.abs(settlement.amount).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Pay button for users who owe money */}
              {settlement.owes && settlement.userId === user.id && (
                <button
                  onClick={() => onPayment(Math.abs(settlement.amount), `Settlement payment`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pay Now
                </button>
              )}
            </div>
          ))}

          {paymentHistory && paymentHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Recent Payments</h4>
              <div className="space-y-2">
                {paymentHistory.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-900">
                        Payment of {payment.currency} {payment.amount}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetDashboard;