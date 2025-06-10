import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Plus, Edit3, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  attendees: string[];
  type: 'flight' | 'accommodation' | 'activity' | 'meal' | 'transport' | 'other';
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripStartDate: Date;
  tripEndDate: Date;
  collaborators: string[];
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  tripStartDate, 
  tripEndDate, 
  collaborators 
}) => {
  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: '1',
      title: 'Flight to Reykjavik',
      description: 'Departure from JFK Airport',
      date: tripStartDate,
      time: '08:30',
      location: 'JFK Airport',
      attendees: collaborators,
      type: 'flight'
    },
    {
      id: '2',
      title: 'Blue Lagoon Visit',
      description: 'Relaxing geothermal spa experience',
      date: addDays(tripStartDate, 1),
      time: '14:00',
      location: 'Blue Lagoon, Iceland',
      attendees: collaborators,
      type: 'activity'
    }
  ]);
  
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(tripStartDate);

  const eventTypes = [
    { value: 'flight', label: 'Flight', color: 'bg-blue-500' },
    { value: 'accommodation', label: 'Hotel', color: 'bg-green-500' },
    { value: 'activity', label: 'Activity', color: 'bg-purple-500' },
    { value: 'meal', label: 'Meal', color: 'bg-orange-500' },
    { value: 'transport', label: 'Transport', color: 'bg-yellow-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' }
  ];

  const getDaysInTrip = () => {
    const days = [];
    let currentDate = new Date(tripStartDate);
    while (currentDate <= tripEndDate) {
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).sort((a, b) => a.time.localeCompare(b.time));
  };

  const addEvent = (eventData: Omit<ScheduleEvent, 'id'>) => {
    const newEvent: ScheduleEvent = {
      ...eventData,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
    setShowAddEvent(false);
  };

  const updateEvent = (eventId: string, updates: Partial<ScheduleEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
    setEditingEvent(null);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Trip Schedule</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Event</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Calendar View */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid gap-6">
              {getDaysInTrip().map((date, index) => {
                const dayEvents = getEventsForDate(date);
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {format(date, 'EEEE, MMMM d')}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Day {index + 1}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {dayEvents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No events scheduled</p>
                        </div>
                      ) : (
                        dayEvents.map((event) => {
                          const eventType = eventTypes.find(t => t.value === event.type);
                          return (
                            <div
                              key={event.id}
                              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <div className={`w-3 h-3 rounded-full mt-2 ${eventType?.color}`} />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {eventType?.label}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{event.time}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{event.location}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Users className="h-3 w-3" />
                                        <span>{event.attendees.length} attendees</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => setEditingEvent(event.id)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteEvent(event.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Add/Edit Event Modal */}
        {(showAddEvent || editingEvent) && (
          <AddEventModal
            isOpen={true}
            onClose={() => {
              setShowAddEvent(false);
              setEditingEvent(null);
            }}
            onSave={editingEvent ? 
              (data) => updateEvent(editingEvent, data) : 
              addEvent
            }
            eventTypes={eventTypes}
            collaborators={collaborators}
            initialData={editingEvent ? events.find(e => e.id === editingEvent) : undefined}
            tripStartDate={tripStartDate}
            tripEndDate={tripEndDate}
          />
        )}
      </div>
    </div>
  );
};

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<ScheduleEvent, 'id'>) => void;
  eventTypes: Array<{ value: string; label: string; color: string }>;
  collaborators: string[];
  initialData?: ScheduleEvent;
  tripStartDate: Date;
  tripEndDate: Date;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eventTypes,
  collaborators,
  initialData,
  tripStartDate,
  tripEndDate
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || tripStartDate,
    time: initialData?.time || '09:00',
    location: initialData?.location || '',
    type: initialData?.type || 'activity',
    attendees: initialData?.attendees || collaborators
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      type: formData.type as ScheduleEvent['type'],
      attendees: formData.attendees
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Event' : 'Add Event'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={format(formData.date, 'yyyy-MM-dd')}
                onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                min={format(tripStartDate, 'yyyy-MM-dd')}
                max={format(tripEndDate, 'yyyy-MM-dd')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Event location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {initialData ? 'Update' : 'Add'} Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;