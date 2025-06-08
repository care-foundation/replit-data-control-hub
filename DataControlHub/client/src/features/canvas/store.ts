import { create } from 'zustand';
import { InferenceData, TrackerData } from '../../types/inference';

interface CanvasState {
  currentInference: InferenceData | null;
  currentTracker: TrackerData | null;
  currentFrame: number;
  
  // Visualization settings
  showRawBbox: boolean;
  showSmoothBbox: boolean;
  showKeypoints: boolean;
  showRegions: boolean;
  
  // Actions
  updateInference: (data: InferenceData) => void;
  updateTracker: (data: TrackerData) => void;
  toggleVisualization: (type: 'rawBbox' | 'smoothBbox' | 'keypoints' | 'regions') => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Initial state
  currentInference: null,
  currentTracker: null,
  currentFrame: 0,
  
  showRawBbox: true,
  showSmoothBbox: true,
  showKeypoints: true,
  showRegions: true,
  
  // Actions
  updateInference: (data) => {
    set({ 
      currentInference: data,
      currentFrame: data.frame_id 
    });
  },
  
  updateTracker: (data) => {
    set({ currentTracker: data });
  },
  
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