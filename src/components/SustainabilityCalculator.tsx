import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Plane, 
  Train, 
  Car, 
  Home, 
  Utensils, 
  Activity,
  TreePine,
  TrendingDown,
  TrendingUp,
  Award,
  Target,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  Star,
  Zap,
  Droplets,
  Calendar,
  Share2,
  Download,
  ArrowRight,
  BarChart3,
  PieChart,
  Sliders as SliderIcon
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useSustainability } from '../hooks/useSupabase';

interface SustainabilityCalculatorProps {
  tripId: string;
}

const SustainabilityCalculator: React.FC<SustainabilityCalculatorProps> = ({ tripId }) => {
  const { trips, initializeSustainability, updateCarbonFootprint, addTransportOption, selectTransportOption, addOffsetContribution } = useApp();
  const { user } = useAuth();
  const { sustainabilityData, isLoading, calculateTransportFootprint, addOffsetContribution: addOffsetToSupabase, refreshReport } = useSustainability(tripId);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'transport' | 'accommodation' | 'offset'>('dashboard');
  const [distance, setDistance] = useState(4200);
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);

  const trip = trips.find(t => t.id === tripId);
  const sustainability = sustainabilityData || trip?.sustainability;

  useEffect(() => {
    if (tripId) {
      refreshReport();
    }
  }, [tripId]);

  if (!trip) return null;

  if (!sustainability && !isLoading) {
    return <SustainabilitySetup tripId={tripId} onSetup={() => initializeSustainability(tripId)} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
        <p className="text-gray-600 ml-3">Loading sustainability data...</p>
      </div>
    );
  }

  const sections = [
    { id: 'dashboard', name: 'Impact Dashboard', icon: BarChart3 },
    { id: 'transport', name: 'Transport', icon: Plane },
    { id: 'accommodation', name: 'Stay & Activities', icon: Home },
    { id: 'offset', name: 'Offset Marketplace', icon: TreePine }
  ];

  const averageTravelerFootprint = 3200; // kg CO2
  const comparisonPercentage = sustainability?.carbon_footprint ? 
    ((sustainability.carbon_footprint.total - averageTravelerFootprint) / averageTravelerFootprint) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Navigation */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit overflow-x-auto scrollbar-thin">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{section.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      {activeSection === 'dashboard' && sustainability && (
        <ImpactDashboard 
          sustainability={sustainability} 
          averageTravelerFootprint={averageTravelerFootprint}
          comparisonPercentage={comparisonPercentage}
        />
      )}

      {activeSection === 'transport' && (
        <TransportComparison 
          sustainability={sustainability}
          distance={distance}
          setDistance={setDistance}
          selectedTransport={selectedTransport}
          setSelectedTransport={setSelectedTransport}
          onSelectOption={(optionId) => selectTransportOption(tripId, optionId)}
          onAddOption={(option) => addTransportOption(tripId, option)}
          onCalculateFootprint={calculateTransportFootprint}
        />
      )}

      {activeSection === 'accommodation' && sustainability && (
        <AccommodationAnalyzer sustainability={sustainability} />
      )}

      {activeSection === 'offset' && sustainability && (
        <OffsetMarketplace 
          sustainability={sustainability}
          onContribute={async (contribution) => {
            await addOffsetToSupabase(contribution.projectId, contribution.amount, contribution.carbonOffset);
            addOffsetContribution(tripId, contribution);
          }}
        />
      )}
    </div>
  );
};

// Sustainability Setup Component
const SustainabilitySetup: React.FC<{ tripId: string; onSetup: () => void }> = ({ tripId, onSetup }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/20 shadow-sm text-center">
      <Leaf className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-4 sm:mb-6" />
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Sus Cal - Sustainability Calculator</h2>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Track your trip's environmental impact and discover ways to travel more sustainably.
      </p>
      
      <button
        onClick={onSetup}
        className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 text-sm sm:text-base"
      >
        Start Sustainability Tracking
      </button>
    </div>
  );
};

// Impact Dashboard Component
const ImpactDashboard: React.FC<{ 
  sustainability: any; 
  averageTravelerFootprint: number;
  comparisonPercentage: number;
}> = ({ sustainability, averageTravelerFootprint, comparisonPercentage }) => {
  const categories = [
    { name: 'Transport', value: sustainability.carbon_footprint.transport, icon: Plane, color: '#3B82F6' },
    { name: 'Accommodation', value: sustainability.carbon_footprint.accommodation, icon: Home, color: '#10B981' },
    { name: 'Food', value: sustainability.carbon_footprint.food, icon: Utensils, color: '#F59E0B' },
    { name: 'Activities', value: sustainability.carbon_footprint.activities, icon: Activity, color: '#EF4444' }
  ];

  const totalOffset = sustainability.offset_contributions?.reduce((sum: number, contrib: any) => sum + contrib.carbon_offset_kg, 0) || 0;
  const netFootprint = sustainability.carbon_footprint.total - totalOffset;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Impact Card */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 sm:p-8 border border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Total Footprint */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Leaf className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold">
                  CO₂
                </div>
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {sustainability.carbon_footprint.total.toLocaleString()} kg
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Total Carbon Footprint</div>
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-green-600">
              <TreePine className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">
                = {sustainability.carbon_footprint.treeEquivalent} trees needed
              </span>
            </div>
          </div>

          {/* Comparison */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                {comparisonPercentage < 0 ? (
                  <TrendingDown className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
                ) : (
                  <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-red-500" />
                )}
              </div>
            </div>
            <div className={`text-xl sm:text-3xl font-bold mb-1 sm:mb-2 ${comparisonPercentage < 0 ? 'text-green-600' : 'text-red-500'}`}>
              {Math.abs(comparisonPercentage).toFixed(1)}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              {comparisonPercentage < 0 ? 'Below' : 'Above'} Average Traveler
            </div>
            <div className="text-xs text-gray-500">
              Average: {averageTravelerFootprint.toLocaleString()} kg CO₂
            </div>
          </div>

          {/* Net Impact */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Target className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {netFootprint.toLocaleString()} kg
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Net Impact (After Offsets)</div>
            <div className="text-xs text-gray-500">
              {totalOffset > 0 ? `${totalOffset.toLocaleString()} kg offset` : 'No offsets yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Breakdown Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Impact Breakdown</h3>
            <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const percentage = sustainability.carbon_footprint.total > 0 ? 
                (category.value / sustainability.carbon_footprint.total) * 100 : 0;
              
              return (
                <div key={category.name} className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div 
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">
                        {category.value.toLocaleString()} kg
                      </div>
                      <div className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: category.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recommendations</h3>
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {sustainability.recommendations?.map((rec: any, index: number) => (
              <div key={index} className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <Leaf className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1 text-xs sm:text-sm">{rec.category}</h4>
                    <p className="text-xs text-gray-600 mb-1 sm:mb-2">{rec.message}</p>
                    <div className="text-xs text-green-600 font-medium">
                      Potential saving: {rec.potentialSaving.toFixed(0)} kg CO₂
                    </div>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-6 sm:py-8">
                <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 text-sm">Great job! Your trip has a low environmental impact.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Transport Comparison Component
const TransportComparison: React.FC<{
  sustainability: any;
  distance: number;
  setDistance: (distance: number) => void;
  selectedTransport: string | null;
  setSelectedTransport: (id: string | null) => void;
  onSelectOption: (optionId: string) => void;
  onAddOption: (option: any) => void;
  onCalculateFootprint: (transportType: string, distance: number, passengers?: number) => Promise<any>;
}> = ({ sustainability, distance, setDistance, selectedTransport, setSelectedTransport, onSelectOption, onAddOption, onCalculateFootprint }) => {
  
  const transportTypes = [
    { type: 'flight', name: 'Flight', icon: Plane, carbonPerKm: 0.255, duration: 5.5, cost: 450 },
    { type: 'train', name: 'Train', icon: Train, carbonPerKm: 0.041, duration: 24, cost: 320 },
    { type: 'bus', name: 'Bus', icon: Car, carbonPerKm: 0.089, duration: 30, cost: 180 },
    { type: 'car', name: 'Car', icon: Car, carbonPerKm: 0.171, duration: 18, cost: 280 }
  ];

  const calculateOptions = () => {
    return transportTypes.map((transport, index) => ({
      id: `calc-${index}`,
      ...transport,
      distance,
      totalCarbon: Math.round(transport.carbonPerKm * distance),
      isRecommended: transport.carbonPerKm === Math.min(...transportTypes.map(t => t.carbonPerKm))
    }));
  };

  const calculatedOptions = calculateOptions();

  const handleSelectTransport = async (option: any) => {
    setSelectedTransport(option.id);
    try {
      await onCalculateFootprint(option.type, distance, 1);
      onSelectOption(option.id);
    } catch (error) {
      console.error('Error calculating transport footprint:', error);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Distance Slider */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Trip Distance</h3>
          <SliderIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">Distance</span>
            <span className="text-base sm:text-lg font-semibold text-gray-900">{distance.toLocaleString()} km</span>
          </div>
          
          <input
            type="range"
            min="100"
            max="15000"
            step="100"
            value={distance}
            onChange={(e) => setDistance(parseInt(e.target.value))}
            className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>100 km</span>
            <span>15,000 km</span>
          </div>
        </div>
      </div>

      {/* Transport Options Comparison */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Transport Options</h3>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Time vs Impact</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {calculatedOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedTransport === option.id;
            
            return (
              <div
                key={option.id}
                onClick={() => handleSelectTransport(option)}
                className={`relative p-4 sm:p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } ${option.isRecommended ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
              >
                {option.isRecommended && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
                    Recommended
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`p-2 sm:p-3 rounded-lg ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{option.name}</h4>
                      <p className="text-xs text-gray-600">{distance.toLocaleString()} km</p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <div className="text-base sm:text-lg font-bold text-gray-900">
                      {option.totalCarbon.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">kg CO₂</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-gray-900">
                      {option.duration}h
                    </div>
                    <div className="text-xs text-gray-600">Duration</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-gray-900">
                      ${option.cost}
                    </div>
                    <div className="text-xs text-gray-600">Est. Cost</div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Carbon per km:</span>
                    <span className="font-medium text-gray-900">
                      {option.carbonPerKm} kg CO₂
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Local Sustainable Transit */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Local Sustainable Transit</h3>
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                <Train className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-xs sm:text-sm">Public Transit</h4>
                <p className="text-xs text-green-600">90% less emissions</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Use local buses, trains, and metro systems for city exploration.
            </p>
          </div>
          
          <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-xs sm:text-sm">Bike Sharing</h4>
                <p className="text-xs text-blue-600">Zero emissions</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Explore cities on two wheels with bike-sharing programs.
            </p>
          </div>
          
          <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-xs sm:text-sm">Electric Vehicles</h4>
                <p className="text-xs text-purple-600">80% less emissions</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Rent electric cars or use electric ride-sharing services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Accommodation Analyzer Component
const AccommodationAnalyzer: React.FC<{ sustainability: any }> = ({ sustainability }) => {
  const accommodations = sustainability.accommodation_options?.length > 0 
    ? sustainability.accommodation_options 
    : [
        {
          id: '1',
          name: 'Eco Lodge Reykjavik',
          accommodation_type: 'eco-lodge',
          carbon_per_night: 12,
          water_usage_liters: 150,
          energy_usage_kwh: 8,
          certifications: ['Green Key', 'EarthCheck'],
          sustainability_score: 9,
          seasonal_impact: 'low'
        },
        {
          id: '2',
          name: 'Downtown Hotel',
          accommodation_type: 'hotel',
          carbon_per_night: 45,
          water_usage_liters: 400,
          energy_usage_kwh: 25,
          certifications: [],
          sustainability_score: 4,
          seasonal_impact: 'high'
        }
      ];

  const certificationInfo = {
    'Green Key': { color: 'green', description: 'International eco-label for tourism' },
    'EarthCheck': { color: 'blue', description: 'World\'s leading sustainability certification' },
    'LEED': { color: 'emerald', description: 'Leadership in Energy and Environmental Design' },
    'EU Ecolabel': { color: 'indigo', description: 'European Union environmental certification' }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Accommodation Options */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Accommodation Analysis</h3>
          <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          {accommodations.map((accommodation) => (
            <div key={accommodation.id} className="p-4 sm:p-6 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">{accommodation.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 capitalize">{accommodation.accommodation_type.replace('-', ' ')}</p>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="flex items-center space-x-0.5 sm:space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          i < Math.floor(accommodation.sustainability_score / 2)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {accommodation.sustainability_score}/10
                  </span>
                </div>
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-lg">
                  <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {accommodation.carbon_per_night} kg CO₂
                    </div>
                    <div className="text-xs text-gray-600">per night</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-lg">
                  <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {accommodation.water_usage_liters}L
                    </div>
                    <div className="text-xs text-gray-600">water per night</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-lg">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {accommodation.energy_usage_kwh} kWh
                    </div>
                    <div className="text-xs text-gray-600">energy per night</div>
                  </div>
                </div>
              </div>
              
              {/* Certifications */}
              {accommodation.certifications.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <h5 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Certifications</h5>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {accommodation.certifications.map((cert) => {
                      const info = certificationInfo[cert as keyof typeof certificationInfo];
                      return (
                        <div
                          key={cert}
                          className={`px-2 py-0.5 sm:px-3 sm:py-1 bg-${info?.color || 'gray'}-100 text-${info?.color || 'gray'}-800 text-xs rounded-full font-medium`}
                          title={info?.description}
                        >
                          {cert}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Seasonal Impact */}
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">Seasonal Impact</span>
                  <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full font-medium ${
                    accommodation.seasonal_impact === 'low' 
                      ? 'bg-green-100 text-green-800'
                      : accommodation.seasonal_impact === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {accommodation.seasonal_impact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Impact */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Activity Impact Analysis</h3>
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm">Low Impact Activities</h4>
            <div className="space-y-2 sm:space-y-3">
              {[
                { name: 'Hiking & Nature Walks', impact: '0.5 kg CO₂', icon: '🥾' },
                { name: 'Local Cultural Tours', impact: '2.1 kg CO₂', icon: '🏛️' },
                { name: 'Cycling Tours', impact: '0.8 kg CO₂', icon: '🚴' },
                { name: 'Wildlife Watching', impact: '1.2 kg CO₂', icon: '🦅' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-base sm:text-lg">{activity.icon}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900">{activity.name}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-green-600 font-medium">{activity.impact}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm">Higher Impact Activities</h4>
            <div className="space-y-2 sm:space-y-3">
              {[
                { name: 'Helicopter Tours', impact: '45.2 kg CO₂', icon: '🚁' },
                { name: 'Motorboat Excursions', impact: '12.8 kg CO₂', icon: '🛥️' },
                { name: 'ATV Adventures', impact: '8.5 kg CO₂', icon: '🏍️' },
                { name: 'Ski Resort Activities', impact: '6.3 kg CO₂', icon: '⛷️' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-base sm:text-lg">{activity.icon}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900">{activity.name}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-red-600 font-medium">{activity.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Offset Marketplace Component
const OffsetMarketplace: React.FC<{ 
  sustainability: any; 
  onContribute: (contribution: any) => void;
}> = ({ sustainability, onContribute }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const totalOffset = sustainability.offset_contributions?.reduce((sum: number, contrib: any) => sum + contrib.carbon_offset_kg, 0) || 0;
  const remainingFootprint = sustainability.carbon_footprint.total - totalOffset;
  const neutralizationProgress = sustainability.carbon_footprint.total > 0 ? (totalOffset / sustainability.carbon_footprint.total) * 100 : 0;

  // Default offset projects if none from Supabase
  const offsetProjects = sustainability.offset_projects || [
    {
      id: '1',
      name: 'Global Forest Restoration',
      project_type: 'forest',
      description: 'Supporting reforestation efforts worldwide to combat climate change',
      image_url: 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?auto=compress&cs=tinysrgb&w=800',
      cost_per_ton: 22,
      location: 'Global',
      impact_description: '1M+ trees planted',
      certification: 'Gold Standard',
      total_offset_tons: 5000
    },
    {
      id: '2',
      name: 'Renewable Energy Development',
      project_type: 'renewable',
      description: 'Funding solar and wind energy projects in developing countries',
      image_url: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=800',
      cost_per_ton: 18,
      location: 'Global',
      impact_description: '50 MW clean energy',
      certification: 'VCS',
      total_offset_tons: 8500
    }
  ];

  const handleContribute = (projectId: string) => {
    const project = offsetProjects.find((p: any) => p.id === projectId);
    if (!project || !contributionAmount) return;

    const amount = parseFloat(contributionAmount);
    const carbonOffset = amount / project.cost_per_ton * 1000; // Convert to kg

    onContribute({
      projectId,
      amount,
      carbonOffset,
      status: 'completed'
    });

    setContributionAmount('');
    setSelectedProject(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Offset Progress */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-green-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Carbon Neutralization Progress</h3>
          <TreePine className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {totalOffset.toLocaleString()} kg
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Offset</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {Math.max(0, remainingFootprint).toLocaleString()} kg
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Remaining to Neutralize</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
              {Math.min(100, neutralizationProgress).toFixed(1)}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Carbon Neutral</div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(neutralizationProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Offset Projects */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Curated Offset Projects</h3>
          <Award className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {offsetProjects.map((project: any) => {
            const isSelected = selectedProject === project.id;
            
            return (
              <div
                key={project.id}
                className={`rounded-lg border-2 transition-all duration-200 ${
                  isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="relative">
                  <img
                    src={project.image_url}
                    alt={project.name}
                    className="w-full h-32 sm:h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                    <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                      project.project_type === 'forest' ? 'bg-green-100 text-green-800' :
                      project.project_type === 'renewable' ? 'bg-blue-100 text-blue-800' :
                      project.project_type === 'community' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.project_type.charAt(0).toUpperCase() + project.project_type.slice(1)}
                    </span>
                  </div>
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white rounded-full p-1 sm:p-2">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{project.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{project.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <div className="text-xs text-gray-600">Location</div>
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">{project.location}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Certification</div>
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">{project.certification}</div>
                    </div>
                  </div>
                  
                  <div className="mb-3 sm:mb-4">
                    <div className="text-xs text-gray-600">Impact</div>
                    <div className="font-medium text-gray-900 text-xs sm:text-sm">{project.impact_description}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                      <div className="text-xs text-gray-600">Cost per ton CO₂</div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">${project.cost_per_ton}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Total offset</div>
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">{project.total_offset_tons.toLocaleString()} tons</div>
                    </div>
                  </div>
                  
                  {isSelected ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Contribution Amount (USD)
                        </label>
                        <input
                          type="number"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs sm:text-sm"
                        />
                        {contributionAmount && (
                          <p className="text-xs text-gray-600 mt-1">
                            Offsets ~{((parseFloat(contributionAmount) / project.cost_per_ton) * 1000).toFixed(0)} kg CO₂
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedProject(null)}
                          className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleContribute(project.id)}
                          disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                          className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                        >
                          Contribute
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedProject(project.id)}
                      className="w-full flex items-center justify-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                    >
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Contribute</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contribution History */}
      {sustainability.offset_contributions && sustainability.offset_contributions.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Your Contributions</h3>
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {sustainability.offset_contributions.map((contribution: any) => {
              const project = offsetProjects.find((p: any) => p.id === contribution.project_id);
              
              return (
                <div key={contribution.id} className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">{project?.name}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(contribution.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm">${contribution.amount_usd}</div>
                    <div className="text-xs text-green-600">
                      {contribution.carbon_offset_kg.toFixed(0)} kg CO₂ offset
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievement Cards */}
      {neutralizationProgress >= 100 && (
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-bold">🎉 Carbon Neutral Achievement!</h3>
            <div className="flex space-x-2">
              <button className="p-1.5 sm:p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button className="p-1.5 sm:p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
          
          <p className="text-base sm:text-lg mb-4">
            Congratulations! You've successfully neutralized your trip's carbon footprint.
          </p>
          
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
            <div>
              <div className="text-lg sm:text-2xl font-bold">{totalOffset.toLocaleString()}</div>
              <div className="text-xs sm:text-sm opacity-90">kg CO₂ Offset</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold">{sustainability.offset_contributions?.length || 0}</div>
              <div className="text-xs sm:text-sm opacity-90">Projects Supported</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold">{Math.round(totalOffset / 22)}</div>
              <div className="text-xs sm:text-sm opacity-90">Trees Equivalent</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityCalculator;