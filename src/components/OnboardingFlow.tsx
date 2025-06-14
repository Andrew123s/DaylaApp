import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  MapPin, 
  Heart, 
  Target, 
  Users, 
  DollarSign, 
  Calendar,
  Plane,
  Camera,
  Mountain,
  Utensils,
  Building,
  Compass,
  Star,
  Globe,
  Leaf,
  Clock,
  Zap,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingFlowProps {
  onComplete: (preferences: UserPreferences) => void;
}

interface UserPreferences {
  travelStyle: string[];
  interests: string[];
  budgetRange: string;
  tripFrequency: string;
  groupPreference: string;
  sustainabilityImportance: number;
  planningStyle: string;
  notifications: {
    tripUpdates: boolean;
    communityPosts: boolean;
    recommendations: boolean;
    reminders: boolean;
  };
  goals: string[];
  destinations: string[];
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    travelStyle: [],
    interests: [],
    budgetRange: '',
    tripFrequency: '',
    groupPreference: '',
    sustainabilityImportance: 5,
    planningStyle: '',
    notifications: {
      tripUpdates: true,
      communityPosts: false,
      recommendations: true,
      reminders: true
    },
    goals: [],
    destinations: []
  });

  const steps = [
    { id: 'welcome', title: 'Welcome to Dayla!', component: WelcomeStep },
    { id: 'travel-style', title: 'Your Travel Style', component: TravelStyleStep },
    { id: 'interests', title: 'What Interests You?', component: InterestsStep },
    { id: 'budget-frequency', title: 'Budget & Frequency', component: BudgetFrequencyStep },
    { id: 'group-planning', title: 'Planning Preferences', component: GroupPlanningStep },
    { id: 'sustainability', title: 'Sustainability Goals', component: SustainabilityStep },
    { id: 'notifications', title: 'Stay Connected', component: NotificationsStep },
    { id: 'goals-destinations', title: 'Your Travel Goals', component: GoalsDestinationsStep },
    { id: 'complete', title: 'All Set!', component: CompletionStep }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(preferences);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col z-50">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-white/20 p-6">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full mb-6">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Compass className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dayla
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h2>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto p-6">
            {/* Question Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
                <div className="p-8">
                  <CurrentStepComponent 
                    preferences={preferences}
                    updatePreferences={updatePreferences}
                    user={user}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-white/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Welcome Step
const WelcomeStep: React.FC<{ user: any }> = ({ user }) => (
  <div className="text-center py-8">
    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
      <Sparkles className="h-10 w-10 text-white" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">
      Welcome to Dayla, {user?.name?.split(' ')[0]}! 🎉
    </h3>
    <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto mb-8">
      Let's personalize your travel planning experience. We'll ask you a few questions to tailor 
      recommendations, features, and content just for you.
    </p>
    <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Target className="h-6 w-6 text-blue-600" />
        </div>
        <p className="text-xs text-gray-600">Personalized</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Zap className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-xs text-gray-600">Smart</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Users className="h-6 w-6 text-purple-600" />
        </div>
        <p className="text-xs text-gray-600">Collaborative</p>
      </div>
    </div>
  </div>
);

// Travel Style Step
const TravelStyleStep: React.FC<{ preferences: UserPreferences; updatePreferences: (updates: Partial<UserPreferences>) => void }> = ({ 
  preferences, 
  updatePreferences 
}) => {
  const travelStyles = [
    { id: 'adventure', name: 'Adventure Seeker', icon: Mountain, description: 'Hiking, extreme sports, outdoor activities' },
    { id: 'cultural', name: 'Cultural Explorer', icon: Building, description: 'Museums, local traditions, historical sites' },
    { id: 'relaxation', name: 'Relaxation Focused', icon: Heart, description: 'Beaches, spas, peaceful getaways' },
    { id: 'foodie', name: 'Foodie Traveler', icon: Utensils, description: 'Local cuisine, cooking classes, food tours' },
    { id: 'photography', name: 'Photography Enthusiast', icon: Camera, description: 'Scenic views, unique shots, visual experiences' },
    { id: 'budget', name: 'Budget Conscious', icon: DollarSign, description: 'Affordable options, value for money' },
    { id: 'luxury', name: 'Luxury Traveler', icon: Star, description: 'Premium experiences, high-end accommodations' },
    { id: 'spontaneous', name: 'Spontaneous Explorer', icon: Compass, description: 'Flexible plans, last-minute decisions' }
  ];

  const toggleStyle = (styleId: string) => {
    const newStyles = preferences.travelStyle.includes(styleId)
      ? preferences.travelStyle.filter(s => s !== styleId)
      : [...preferences.travelStyle, styleId];
    updatePreferences({ travelStyle: newStyles });
  };

  return (
    <div className="py-4">
      <p className="text-gray-600 mb-6 text-center">
        Select all travel styles that resonate with you (choose as many as you like)
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto scrollbar-thin pr-2">
        {travelStyles.map((style) => {
          const Icon = style.icon;
          const isSelected = preferences.travelStyle.includes(style.id);
          
          return (
            <button
              key={style.id}
              onClick={() => toggleStyle(style.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {style.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">{style.description}</p>
                </div>
                {isSelected && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Interests Step
const InterestsStep: React.FC<{ preferences: UserPreferences; updatePreferences: (updates: Partial<UserPreferences>) => void }> = ({ 
  preferences, 
  updatePreferences 
}) => {
  const interests = [
    'Nature & Wildlife', 'Art & Museums', 'Food & Drink', 'Music & Festivals',
    'Sports & Fitness', 'History & Architecture', 'Shopping', 'Nightlife',
    'Photography', 'Local Culture', 'Adventure Sports', 'Wellness & Spa',
    'Technology', 'Literature', 'Beaches', 'Mountains',
    'Cities', 'Countryside', 'Islands', 'Deserts'
  ];

  const toggleInterest = (interest: string) => {
    const newInterests = preferences.interests.includes(interest)
      ? preferences.interests.filter(i => i !== interest)
      : [...preferences.interests, interest];
    updatePreferences({ interests: newInterests });
  };

  return (
    <div className="py-4">
      <p className="text-gray-600 mb-6 text-center">
        What are you most interested in when traveling? (Select up to 8)
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto scrollbar-thin pr-2">
        {interests.map((interest) => {
          const isSelected = preferences.interests.includes(interest);
          const isDisabled = !isSelected && preferences.interests.length >= 8;
          
          return (
            <button
              key={interest}
              onClick={() => !isDisabled && toggleInterest(interest)}
              disabled={isDisabled}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isSelected 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                  : isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {interest}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 text-center mt-4">
        Selected: {preferences.interests.length}/8
      </p>
    </div>
  );
};

// Budget & Frequency Step
const BudgetFrequencyStep: React.FC<{ preferences: UserPreferences; updatePreferences: (updates: Partial<UserPreferences>) => void }> = ({ 
  preferences, 
  updatePreferences 
}) => {
  const budgetRanges = [
    { id: 'budget', name: 'Budget Traveler', range: '$500 - $1,500', icon: DollarSign },
    { id: 'moderate', name: 'Moderate Spender', range: '$1,500 - $3,500', icon: DollarSign },
    { id: 'comfortable', name: 'Comfortable Budget', range: '$3,500 - $7,000', icon: DollarSign },
    { id: 'luxury', name: 'Luxury Traveler', range: '$7,000+', icon: Star }
  ];

  const frequencies = [
    { id: 'occasional', name: 'Occasional Traveler', description: '1-2 trips per year' },
    { id: 'regular', name: 'Regular Traveler', description: '3-4 trips per year' },
    { id: 'frequent', name: 'Frequent Traveler', description: '5+ trips per year' },
    { id: 'digital-nomad', name: 'Digital Nomad', description: 'Always traveling' }
  ];

  return (
    <div className="py-4 space-y-8 max-h-96 overflow-y-auto scrollbar-thin pr-2">
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Typical trip budget per person</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {budgetRanges.map((budget) => {
            const Icon = budget.icon;
            const isSelected = preferences.budgetRange === budget.id;
            
            return (
              <button
                key={budget.id}
                onClick={() => updatePreferences({ budgetRange: budget.id })}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div>
                    <h5 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {budget.name}
                    </h5>
                    <p className="text-sm text-gray-600">{budget.range}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-blue-600 ml-auto" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-4">How often do you travel?</h4>
        <div className="space-y-3">
          {frequencies.map((frequency) => {
            const isSelected = preferences.tripFrequency === frequency.id;
            
            return (
              <button
                key={frequency.id}
                onClick={() => updatePreferences({ tripFrequency: frequency.id })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {frequency.name}
                    </h5>
                    <p className="text-sm text-gray-600">{frequency.description}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-blue-600" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Group Planning Step
const GroupPlanningStep: React.FC<{ preferences: UserPreferences; updatePreferences: (updates: Partial<UserPreferences>) => void }> = ({ 
  preferences, 
  updatePreferences 
}) => {
  const groupPreferences = [
    { id: 'solo', name: 'Solo Traveler', description: 'I prefer traveling alone', icon: Users },
    { id: 'couple', name: 'Couple Travel', description: 'Usually travel with my partner', icon: Heart },
    { id: 'small-group', name: 'Small Groups', description: '3-6 friends or family', icon: Users },
    { id: 'large-group', name: 'Large Groups', description: '7+ people, events, reunions', icon: Users }
  ];

  const planningStyles = [
    { id: 'detailed', name: 'Detailed Planner', description: 'I like to plan everything in advance' },
    { id: 'flexible', name: 'Flexible Planner', description: 'I plan some things but leave room for spontaneity' },
    { id: 'minimal', name: 'Minimal Planner', description: 'I prefer to figure things out as I go' }
  ];

  return (
    <div className="py-4 space-y-8 max-h-96 overflow-y-auto scrollbar-thin pr-2">
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Who do you usually travel with?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groupPreferences.map((group) => {
            const Icon = group.icon;
            const isSelected = preferences.groupPreference === group.id;
            
            return (
              <button
                key={group.id}
                onClick={() => updatePreferences({ groupPreference: group.id })}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div>
                    <h5 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {group.name}
                    </h5>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-blue-600 ml-auto" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-4">What's your planning style?</h4>
        <div className="space-y-3">
          {planningStyles.map((style) => {
            const isSelected = preferences.planningStyle === style.id;
            
            return (
              <button
                key={style.id}
                onClick={() => updatePreferences({ planningStyle: style.id })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {style.name}
                    </h5>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-blue-600" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Sustainability Step
const SustainabilityStep: React.FC<{ preferences: UserPreferences; updatePreferences: (updates: Partial<UserPreferences>) => void }> = ({ 
  preferences, 
  updatePreferences 
}) => {
  const sustainabilityLevels = [
    { value: 1, label: 'Not Important', description: 'I don\'t consider environmental impact' },
    { value: 3, label: 'Somewhat Important', description: 'I\'m aware but it\'s not a priority' },
    { value: 5, label: 'Moderately Important', description: 'I try to make sustainable choices when convenient' },
    { value: 7, label: 'Very Important', description: 'I actively seek eco-friendly options' },
    { value: 10, label: 'Extremely Important', description: 'Sustainability is a top priority in all my travel decisions' }
  ];

  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <p className="text-gray-600">
          How important is sustainable and eco-friendly travel to you?
        </p>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin pr-2">
        {sustainabilityLevels.map((level) => {
          const isSelected = preferences.sustainabilityImportance === level.value;
          
          return (
            <button
              key={level.value}
              onClick={() => updatePreferences({ sustainabilityImportance: level.value })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className={`font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                    {level.label}
                  </h5>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < level.value / 2 ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-green-600" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Notifications Step
const NotificationsStep: React.FC<{ preferences: UserPreferences; updatePreferences: (updates: Partial<UserPreferences>) => void }> = ({ 
  preferences, 
  updatePreferences 
}) => {
  const notificationTypes = [
    {
      key: 'tripUpdates',
      name: 'Trip Updates',
      description: 'Get notified when collaborators make changes to your trips',
      icon: Calendar,
      recommended: true
    },
    {
      key: 'communityPosts',
      name: 'Community Posts',
      description: 'Discover new travel experiences from the community',
      icon: Users,
      recommended: false
    },
    {
      key: 'recommendations',
      name: 'Personalized Recommendations',
      description: 'Receive tailored suggestions based on your preferences',
      icon: Target,
      recommended: true
    },
    {
      key: 'reminders',
      name: 'Travel Reminders',
      description: 'Important reminders about upcoming trips and deadlines',
      icon: Clock,
      recommended: true
    }
  ];

  const updateNotification = (key: string, value: boolean) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        [key]: value
      }
    });
  };

  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">
          Choose how you'd like to stay updated. You can change these anytime in settings.
        </p>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin pr-2">
        {notificationTypes.map((type) => {
          const Icon = type.icon;
          const isEnabled = preferences.notifications[type.key as keyof typeof preferences.notifications];
          
          return (
            <div
              key={type.key}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium text-gray-900">{type.name}</h5>
                    {type.recommended && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => updateNotification(type.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Goals & Destinations Step
const GoalsDestinationsStep: React.FC<{ preferences: UserPreferences; updatePreferences: (updates: Partial<UserPreferences>) => void }> = ({ 
  preferences, 
  updatePreferences 
}) => {
  const travelGoals = [
    'Visit all 7 continents',
    'Learn a new language through travel',
    'Try local cuisine in 20 countries',
    'Complete a pilgrimage or spiritual journey',
    'Go on a solo adventure',
    'Take a family trip every year',
    'Visit UNESCO World Heritage sites',
    'Experience different cultures',
    'Document travels through photography',
    'Travel sustainably and responsibly',
    'Visit friends around the world',
    'Explore hidden gems off the beaten path'
  ];

  const bucketListDestinations = [
    'Japan', 'Iceland', 'New Zealand', 'Peru', 'Morocco', 'Thailand',
    'Norway', 'Italy', 'Australia', 'Egypt', 'India', 'Greece',
    'Brazil', 'South Africa', 'Turkey', 'Vietnam', 'Portugal', 'Jordan',
    'Nepal', 'Chile', 'Indonesia', 'Kenya', 'Croatia', 'Myanmar'
  ];

  const toggleGoal = (goal: string) => {
    const newGoals = preferences.goals.includes(goal)
      ? preferences.goals.filter(g => g !== goal)
      : [...preferences.goals, goal];
    updatePreferences({ goals: newGoals });
  };

  const toggleDestination = (destination: string) => {
    const newDestinations = preferences.destinations.includes(destination)
      ? preferences.destinations.filter(d => d !== destination)
      : [...preferences.destinations, destination];
    updatePreferences({ destinations: newDestinations });
  };

  return (
    <div className="py-4 space-y-8 max-h-96 overflow-y-auto scrollbar-thin pr-2">
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span>What are your travel goals? (Select up to 5)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {travelGoals.map((goal) => {
            const isSelected = preferences.goals.includes(goal);
            const isDisabled = !isSelected && preferences.goals.length >= 5;
            
            return (
              <button
                key={goal}
                onClick={() => !isDisabled && toggleGoal(goal)}
                disabled={isDisabled}
                className={`p-3 rounded-lg text-sm text-left transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-100 text-blue-900 border-2 border-blue-500' 
                    : isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-transparent'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{goal}</span>
                  {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">Selected: {preferences.goals.length}/5</p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Globe className="h-5 w-5 text-green-600" />
          <span>Dream destinations on your bucket list (Select up to 8)</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {bucketListDestinations.map((destination) => {
            const isSelected = preferences.destinations.includes(destination);
            const isDisabled = !isSelected && preferences.destinations.length >= 8;
            
            return (
              <button
                key={destination}
                onClick={() => !isDisabled && toggleDestination(destination)}
                disabled={isDisabled}
                className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md' 
                    : isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {destination}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">Selected: {preferences.destinations.length}/8</p>
      </div>
    </div>
  );
};

// Completion Step
const CompletionStep: React.FC<{ preferences: UserPreferences }> = ({ preferences }) => (
  <div className="text-center py-8">
    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
      <Check className="h-10 w-10 text-white" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">
      Perfect! Your profile is all set up 🎉
    </h3>
    <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto mb-8">
      We've personalized Dayla based on your preferences. You can always update these settings 
      in your profile later.
    </p>
    
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-w-md mx-auto">
      <h4 className="font-semibold text-gray-900 mb-4">Your personalized experience includes:</h4>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center space-x-2">
          <Check className="h-4 w-4 text-green-600" />
          <span>Tailored destination recommendations</span>
        </div>
        <div className="flex items-center space-x-2">
          <Check className="h-4 w-4 text-green-600" />
          <span>Customized planning tools</span>
        </div>
        <div className="flex items-center space-x-2">
          <Check className="h-4 w-4 text-green-600" />
          <span>Relevant community content</span>
        </div>
        <div className="flex items-center space-x-2">
          <Check className="h-4 w-4 text-green-600" />
          <span>Smart budget suggestions</span>
        </div>
        {preferences.sustainabilityImportance >= 5 && (
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Eco-friendly travel options</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default OnboardingFlow;