import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, Share2, MapPin, Clock, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import CreateTripModal from '../components/CreateTripModal';

const Dashboard: React.FC = () => {
  const { trips } = useApp();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const upcomingTrips = trips.filter(trip => trip.startDate > new Date());
  const pastTrips = trips.filter(trip => trip.endDate < new Date());

  // Get personalized recommendations based on user preferences
  const getPersonalizedRecommendations = () => {
    if (!user?.preferences) return [];

    const recommendations = [];
    
    // Budget-based recommendations
    if (user.preferences.budgetRange === 'budget') {
      recommendations.push({
        type: 'budget',
        title: 'Budget-Friendly Destinations',
        description: 'Explore amazing places without breaking the bank',
        destinations: ['Vietnam', 'Guatemala', 'Nepal', 'Bulgaria']
      });
    } else if (user.preferences.budgetRange === 'luxury') {
      recommendations.push({
        type: 'luxury',
        title: 'Luxury Travel Experiences',
        description: 'Indulge in premium destinations and experiences',
        destinations: ['Maldives', 'Switzerland', 'Dubai', 'French Polynesia']
      });
    }

    // Interest-based recommendations
    if (user.preferences.interests.includes('Nature & Wildlife')) {
      recommendations.push({
        type: 'nature',
        title: 'Wildlife & Nature Adventures',
        description: 'Connect with nature in these stunning locations',
        destinations: ['Costa Rica', 'Kenya', 'New Zealand', 'Madagascar']
      });
    }

    if (user.preferences.interests.includes('Food & Drink')) {
      recommendations.push({
        type: 'food',
        title: 'Culinary Destinations',
        description: 'Taste your way around the world',
        destinations: ['Italy', 'Japan', 'Peru', 'Thailand']
      });
    }

    // Sustainability-based recommendations
    if (user.preferences.sustainabilityImportance >= 7) {
      recommendations.push({
        type: 'sustainable',
        title: 'Eco-Friendly Destinations',
        description: 'Travel responsibly to these sustainable destinations',
        destinations: ['Costa Rica', 'Norway', 'Bhutan', 'Slovenia']
      });
    }

    return recommendations.slice(0, 2); // Show max 2 recommendations
  };

  const personalizedRecommendations = getPersonalizedRecommendations();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Personalized Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}! 
              {user?.preferences && <Sparkles className="inline h-6 w-6 text-yellow-500 ml-2" />}
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.preferences 
                ? `Ready for your next ${user.preferences.travelStyle.includes('adventure') ? 'adventure' : 'journey'}?`
                : 'Plan, collaborate, and explore the world together'
              }
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            <span>New Trip</span>
          </button>
        </div>

        {/* Personalized Recommendations */}
        {personalizedRecommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span>Recommended for You</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personalizedRecommendations.map((rec, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{rec.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.destinations.map((dest, i) => (
                      <span key={i} className="px-3 py-1 bg-white text-blue-800 text-xs rounded-full font-medium">
                        {dest}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
                <p className="text-sm text-gray-600">Total Trips</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{upcomingTrips.length}</p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {trips.reduce((acc, trip) => acc + trip.collaborators.length, 0)}
                </p>
                <p className="text-sm text-gray-600">Collaborators</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{pastTrips.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Trips */}
        {upcomingTrips.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Adventures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}

        {/* All Trips */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Trips</h2>
          {trips.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 text-center border border-white/20">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Create Your First Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

interface TripCardProps {
  trip: any;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const isUpcoming = trip.startDate > new Date();

  return (
    <Link to={`/planner/${trip.id}`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm hover:shadow-lg transition-all duration-200 group">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: trip.color }}
          />
          <div className="flex items-center space-x-2">
            <Share2 className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            <Users className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            <span className="text-sm text-gray-500">{trip.collaborators.length}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {trip.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{trip.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{format(trip.startDate, 'MMM dd')}</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isUpcoming
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isUpcoming ? 'Upcoming' : 'Completed'}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{trip.notes.length} notes</span>
            <span className="text-xs text-gray-500 font-mono">#{trip.inviteCode}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;