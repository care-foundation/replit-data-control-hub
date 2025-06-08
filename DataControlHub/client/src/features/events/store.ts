import { create } from 'zustand';
import { EventLogEntry, TrackerData } from '../../types/inference';

interface EventsState {
  events: EventLogEntry[];
  addEvent: (event: Omit<EventLogEntry, 'id'>) => void;
  addEventFromTracker: (data: TrackerData) => void;
  clearEvents: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],

  addEvent: (event) => {
    const state = get();
    const newEvent: EventLogEntry = {
      ...event,
      id: `${event.timestamp}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    set({
      events: [newEvent, ...state.events].slice(0, 50) // Keep only last 50 events
    });
  },

  addEventFromTracker: (data) => {
    if (data.event) {
      const eventSeverity = 
        data.event.includes('outside') || data.event.includes('exit') ? 'warning' as const :
        data.event.includes('instability') ? 'error' as const :
        data.event.includes('occupied') || data.event.includes('detected') ? 'success' as const : 'info' as const;
      
      const eventMessage = data.event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const eventDetails = data.event_payload ? 
        Object.entries(data.event_payload)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(' | ') : '';
      
      get().addEvent({
        timestamp: data.timestamp,
        type: data.event,
        personId: data.event_payload?.person_id,
        message: eventMessage,
        details: eventDetails,
        severity: eventSeverity
      });
    }
  },

  clearEvents: () => set({ events: [] })
}));