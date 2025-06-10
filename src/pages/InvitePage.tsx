import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Compass, Users, MapPin, Calendar, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const InvitePage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user } = useAuth();
  const { trips, joinTripByInvite } = useApp();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      const foundTrip = trips.find(t => t.inviteCode === inviteCode);
      setTrip(foundTrip);
      
      // Check if user is already a collaborator
      if (foundTrip && user && foundTrip.collaborators.includes(user.id)) {
        setHasJoined(true);
      }
    }
  }, [inviteCode, trips, user]);

  const handleJoinTrip = async () => {
    if (!user || !inviteCode || !trip) return;

    setIsJoining(true);
    const success = joinTripByInvite(inviteCode, user.id, user.name, user.avatar);
    
    if (success) {
      setHasJoined(true);
      setTimeout(() => {
        navigate(`/planner/${trip.id}`);
      }, 2000);
    }
    
    setIsJoining(false);
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Compass className="h-10 w-10 text-blue-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dayla
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invite</h2>
            <p className="text-gray-600 mb-6">
              This invite link is invalid or has expired. Please check with the person who sent you this link.
            </p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Compass className="h-10 w-10 text-blue-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dayla
              </span>
            </div>
          </div>

          {/* Trip Info */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: trip.color }}
            >
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{trip.title}</h2>
            <p className="text-gray-600 mb-4">{trip.description}</p>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(trip.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{trip.collaborators.length} collaborators</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!user ? (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">
                You need to sign up or log in to join this trip planning session.
              </p>
              <Link
                to="/signup"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <UserPlus className="h-5 w-5" />
                <span>Sign Up to Join</span>
              </Link>
              <Link
                to="/login"
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span>Log In</span>
              </Link>
            </div>
          ) : hasJoined ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to the team!</h3>
              <p className="text-gray-600 mb-6">
                You're now part of this trip planning session. Redirecting you to the planning board...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">
                You've been invited to collaborate on <strong>{trip.title}</strong>. 
                Join the planning session to add ideas, notes, and help plan this amazing trip!
              </p>
              <button
                onClick={handleJoinTrip}
                disabled={isJoining}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Join Trip Planning</span>
                  </>
                )}
              </button>
              <Link
                to="/"
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>Go to Dashboard</span>
              </Link>
            </div>
          )}

          {/* Invite Code */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Invite Code: <span className="font-mono font-medium">{inviteCode}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;