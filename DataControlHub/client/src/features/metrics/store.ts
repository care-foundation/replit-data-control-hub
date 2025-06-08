import { create } from 'zustand';
import { SystemMetrics, InferenceData, TrackerData } from '../../types/inference';

interface MetricsState {
  metrics: SystemMetrics;
  updateMetricsFromInference: (data: InferenceData) => void;
  updateMetricsFromTracker: (data: TrackerData) => void;
  updateFps: (fps: number) => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  metrics: {
    fps: 0,
    avgConfidence: 0,
    activeTracks: 0,
    detectionsPerFrame: 0,
    dropFrames: 0,
    criticalKeypoints: {}
  },

  updateMetricsFromInference: (data) => {
    const state = get();
    
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
    
    set({
      metrics: {
        ...state.metrics,
        avgConfidence,
        activeTracks: data.detections.length,
        detectionsPerFrame: data.detections.length,
        criticalKeypoints
      }
    });
  },

  updateMetricsFromTracker: (data) => {
    const state = get();
    set({
      metrics: {
        ...state.metrics,
        activeTracks: data.tracks.length
      }
    });
  },

  updateFps: (fps) => {
    const state = get();
    set({
      metrics: {
        ...state.metrics,
        fps
      }
    });
  }
}));