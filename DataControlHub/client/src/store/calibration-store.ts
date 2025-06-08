import { create } from 'zustand';
import { InferenceData, TrackerData, SystemMetrics, EventLogEntry, TimelineData } from '../types/inference';

interface CalibrationState {
  // Connection state
  connected: boolean;
  
  // Current data
  currentInference: InferenceData | null;
  currentTracker: TrackerData | null;
  currentFrame: number;
  
  // Metrics
  metrics: SystemMetrics;
  
  // Timeline data (last 10 seconds)
  timelineData: TimelineData;
  
  // Event log
  events: EventLogEntry[];
  
  // Canvas settings
  showRawBbox: boolean;
  showSmoothBbox: boolean;
  showKeypoints: boolean;
  showRegions: boolean;
  
  // Actions
  setConnected: (connected: boolean) => void;
  updateInference: (data: InferenceData) => void;
  updateTracker: (data: TrackerData) => void;
  addEvent: (event: Omit<EventLogEntry, 'id'>) => void;
  clearEvents: () => void;
  toggleVisualization: (type: 'rawBbox' | 'smoothBbox' | 'keypoints' | 'regions') => void;
}

export const useCalibrationStore = create<CalibrationState>((set, get) => ({
  // Initial state
  connected: false,
  currentInference: null,
  currentTracker: null,
  currentFrame: 0,
  
  metrics: {
    fps: 0,
    avgConfidence: 0,
    activeTracks: 0,
    detectionsPerFrame: 0,
    dropFrames: 0,
    criticalKeypoints: {}
  },
  
  timelineData: {
    confidence: new Array(720).fill(0), // 2 minutes at 6 FPS (120 seconds * 6)
    detections: new Array(720).fill(0),
    keypoints: new Array(720).fill(0)
  },
  
  events: [],
  
  showRawBbox: true,
  showSmoothBbox: true,
  showKeypoints: true,
  showRegions: true,
  
  // Actions
  setConnected: (connected) => set({ connected }),
  
  updateInference: (data) => {
    const state = get();
    
    // Update current data
    set({ 
      currentInference: data,
      currentFrame: data.frame_id 
    });
    
    // Calculate metrics
    const avgConfidence = data.detections.length > 0 
      ? data.detections.reduce((sum, det) => sum + det.confidence, 0) / data.detections.length 
      : 0;
    
    const criticalKeypoints: Record<string, number> = {};
    data.detections.forEach(detection => {
      detection.keypoints.forEach(kp => {
        if (['nose', 'left_hand', 'right_hand', 'left_shoulder', 'right_shoulder'].includes(kp.name)) {
          criticalKeypoints[kp.name] = kp.conf;
        }
      });
    });
    
    // Update timeline data
    const newTimelineData = { ...state.timelineData };
    newTimelineData.confidence.shift();
    newTimelineData.confidence.push(avgConfidence);
    newTimelineData.detections.shift();
    newTimelineData.detections.push(data.detections.length);
    
    const keypointDetectionRate = data.detections.length > 0 
      ? data.detections[0].keypoints.filter(kp => kp.conf > 0.5).length / data.detections[0].keypoints.length 
      : 0;
    newTimelineData.keypoints.shift();
    newTimelineData.keypoints.push(keypointDetectionRate);
    
    set({
      metrics: {
        ...state.metrics,
        avgConfidence,
        activeTracks: data.detections.length,
        detectionsPerFrame: data.detections.length,
        criticalKeypoints
      },
      timelineData: newTimelineData
    });
  },
  
  updateTracker: (data) => {
    const state = get();
    
    set({ currentTracker: data });
    
    // Add event if present
    if (data.event) {
      const eventSeverity = 
        data.event.includes('outside') || data.event.includes('exit') ? 'warning' :
        data.event.includes('instability') ? 'error' :
        data.event.includes('occupied') || data.event.includes('detected') ? 'success' : 'info';
      
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
    
    // Update metrics
    set({
      metrics: {
        ...state.metrics,
        activeTracks: data.tracks.length
      }
    });
  },
  
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
  
  clearEvents: () => set({ events: [] }),
  
  toggleVisualization: (type) => {
    const state = get();
    switch (type) {
      case 'rawBbox':
        set({ showRawBbox: !state.showRawBbox });
        break;
      case 'smoothBbox':
        set({ showSmoothBbox: !state.showSmoothBbox });
        break;
      case 'keypoints':
        set({ showKeypoints: !state.showKeypoints });
        break;
      case 'regions':
        set({ showRegions: !state.showRegions });
        break;
    }
  }
}));
