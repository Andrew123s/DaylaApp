import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  DollarSign,
  Eye,
  Edit3,
  Trash2,
  Flag,
  Download,
  BarChart3,
  TrendingUp,
  Globe,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useAdminTrips } from '../../hooks/useAdminTrips';

const TripManagement: React.FC = () => {
  const {
    trips,
    totalTrips,
    isLoading,
    searchTrips,
    updateTripStatus,
    deleteTrip,
    flagTrip,
    exportTrips,
    getTripDetails
  } = useAdminTrips();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tripsPerPage] = useState(20);

  useEffect(() => {
    searchTrips(searchQuery, statusFilter, dateFilter, currentPage, tripsPerPage);
  }, [searchQuery, statusFilter, dateFilter, currentPage]);

  const handleTripAction = async (tripId: string, action: 'suspend' | 'activate' | 'delete' | 'flag') => {
    try {
      if (action === 'delete') {
        await deleteTrip(tripId);
      } else if (action === 'flag') {
        await flagTrip(tripId, 'inappropriate_content');
      } else {
        await updateTripStatus(tripId, action === 'activate' ? 'active' : 'suspended');
      }
      searchTrips(searchQuery, statusFilter, dateFilter, currentPage, tripsPerPage);
    } catch (error) {
      console.error(`Error ${action}ing trip:`, error);
    }
  };

  const handleViewTrip = async (tripId: string) => {
    const tripDetails = await getTripDetails(tripId);
    setSelectedTrip(tripDetails);
    setShowTripModal(true);
  };

  const handleExport = () => {
    exportTrips(searchQuery, statusFilter, dateFilter);
  };

  const totalPages = Math.ceil(totalTrips / tripsPerPage);

  // Calculate stats
  const activeTrips = trips.filter(t => t.status === 'active').length;
  const publicTrips = trips.filter(t => t.is_public).length;
  const flaggedTrips = trips.filter(t => t.is_flagged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all trips on the platform
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTrips.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Trips</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeTrips}</p>
              <p className="text-sm text-gray-600">Active Trips</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{publicTrips}</p>
              <p className="text-sm text-gray-600">Public Trips</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{flaggedTrips}</p>
              <p className="text-sm text-gray-600">Flagged Trips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="flagged">Flagged</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {selectedTrips.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedTrips.length} selected
              </span>
              <button
                onClick={() => selectedTrips.forEach(id => handleTripAction(id, 'flag'))}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Flag
              </button>
              <button
                onClick={() => selectedTrips.forEach(id => handleTripAction(id, 'suspend'))}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
              >
                Suspend
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTrips.length === trips.length && trips.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTrips(trips.map(t => t.id));
                      } else {
                        setSelectedTrips([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collaborators
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading trips...</span>
                    </div>
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No trips found
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTrips.includes(trip.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTrips([...selectedTrips, trip.id]);
                          } else {
                            setSelectedTrips(selectedTrips.filter(id => id !== trip.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: trip.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{trip.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {trip.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <img
                          src={trip.owner?.avatar_url || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2'}
                          alt={trip.owner?.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {trip.owner?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div>{new Date(trip.start_date).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          to {new Date(trip.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {trip.collaborator_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {trip.budget ? `$${trip.budget.toLocaleString()}` : 'Not set'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          trip.status === 'active' ? 'bg-green-100 text-green-800' :
                          trip.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trip.status}
                        </span>
                        {trip.is_public && (
                          <Globe className="h-4 w-4 text-blue-500" title="Public Trip" />
                        )}
                        {trip.is_flagged && (
                          <Flag className="h-4 w-4 text-red-500" title="Flagged" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewTrip(trip.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleTripAction(trip.id, 'flag')}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Flag Trip"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleTripAction(trip.id, trip.status === 'active' ? 'suspend' : 'activate')}
                          className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                          title={trip.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {trip.status === 'active' ? <Lock className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleTripAction(trip.id, 'delete')}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Trip"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * tripsPerPage + 1} to {Math.min(currentPage * tripsPerPage, totalTrips)} of {totalTrips} trips
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      {showTripModal && selectedTrip && (
        <TripDetailsModal
          trip={selectedTrip}
          onClose={() => setShowTripModal(false)}
          onTripUpdate={() => {
            searchTrips(searchQuery, statusFilter, dateFilter, currentPage, tripsPerPage);
            setShowTripModal(false);
          }}
        />
      )}
    </div>
  );
};

// Trip Details Modal Component
interface TripDetailsModalProps {
  trip: any;
  onClose: () => void;
  onTripUpdate: () => void;
}

const TripDetailsModal: React.FC<TripDetailsModalProps> = ({ trip, onClose, onTripUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Trip Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Trip Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: trip.color }}
                />
                <h3 className="text-xl font-semibold text-gray-900">{trip.title}</h3>
              </div>
              
              <p className="text-gray-600">{trip.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{new Date(trip.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium">{new Date(trip.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(trip.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collaborators:</span>
                  <span className="font-medium">{trip.collaborator_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">{trip.budget ? `$${trip.budget.toLocaleString()}` : 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Owner Information</h4>
              <div className="flex items-center space-x-3">
                <img
                  src={trip.owner?.avatar_url || 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2'}
                  alt={trip.owner?.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{trip.owner?.name}</p>
                  <p className="text-sm text-gray-600">{trip.owner?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Trip Statistics</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notes:</span>
                    <span className="font-medium">{trip.notes_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expenses:</span>
                    <span className="font-medium">{trip.expenses_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-medium">${(trip.total_spent || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Handle trip edit
                onTripUpdate();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripManagement;