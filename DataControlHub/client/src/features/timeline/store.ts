import { create } from 'zustand';
import { TimelineData } from '../../types/inference';

interface TimelineState {
  timelineData: TimelineData;
  updateTimeline: (confidence: number, detections: number, keypoints: number) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  timelineData: {
    confidence: new Array(720).fill(0), // 2 minutes at 6 FPS (120 seconds * 6)
    detections: new Array(720).fill(0),
    keypoints: new Array(720).fill(0)
  },

  updateTimeline: (confidence, detections, keypoints) => {
    set((state) => {
      const newConfidence = [...state.timelineData.confidence];
      const newDetections = [...state.timelineData.detections];
      const newKeypoints = [...state.timelineData.keypoints];
      
      // Shift arrays and add new values
      newConfidence.shift();
      newConfidence.push(confidence);
      newDetections.shift();
      newDetections.push(detections);
      newKeypoints.shift();
      newKeypoints.push(keypoints);
      
      return {
        timelineData: {
          confidence: newConfidence,
          detections: newDetections,
          keypoints: newKeypoints
        }
      };
    });
  }
}));