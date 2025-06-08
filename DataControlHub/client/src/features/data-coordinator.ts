import { WebSocketManager, WebSocketEvents } from './connection/websocket-manager';
import { useConnectionStore } from './connection/store';
import { useCanvasStore } from './canvas/store';
import { useMetricsStore } from './metrics/store';
import { useTimelineStore } from './timeline/store';
import { useEventsStore } from './events/store';
import { InferenceData, TrackerData } from '../types/inference';

class DataCoordinator {
  private wsManager: WebSocketManager | null = null;

  initialize() {
    if (this.wsManager) return;

    const events: WebSocketEvents = {
      onConnect: () => {
        useConnectionStore.getState().setConnected(true);
      },

      onDisconnect: () => {
        useConnectionStore.getState().setConnected(false);
      },

      onInferenceData: (data: InferenceData) => {
        // Update canvas
        useCanvasStore.getState().updateInference(data);
        
        // Update metrics
        useMetricsStore.getState().updateMetricsFromInference(data);
        
        // Update timeline
        const avgConfidence = data.detections.length > 0 
          ? data.detections.reduce((sum, det) => sum + det.confidence, 0) / data.detections.length 
          : 0;
        
        const totalKeypoints = data.detections.reduce((total, detection) => {
          return total + detection.keypoints.length;
        }, 0);
        
        const validKeypoints = data.detections.reduce((valid, detection) => {
          return valid + detection.keypoints.filter(kp => kp.conf > 0.5).length;
        }, 0);
        
        const keypointDetectionRate = totalKeypoints > 0 ? validKeypoints / totalKeypoints : 0;
        
        useTimelineStore.getState().updateTimeline(
          avgConfidence,
          data.detections.length,
          keypointDetectionRate
        );
      },

      onTrackerData: (data: TrackerData) => {
        // Update canvas
        useCanvasStore.getState().updateTracker(data);
        
        // Update metrics
        useMetricsStore.getState().updateMetricsFromTracker(data);
        
        // Update events
        useEventsStore.getState().addEventFromTracker(data);
      },

      onFpsUpdate: (fps: number) => {
        useMetricsStore.getState().updateFps(fps);
      }
    };

    this.wsManager = new WebSocketManager(events);
  }

  disconnect() {
    if (this.wsManager) {
      this.wsManager.disconnect();
      this.wsManager = null;
    }
  }
}

export const dataCoordinator = new DataCoordinator();