import { useCalibrationStore } from '../store/calibration-store';
import { InferenceData, TrackerData } from '../types/inference';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private fpsCounter = 0;
  private lastFpsUpdate = Date.now();
  private fpsInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        useCalibrationStore.getState().setConnected(true);
        this.reconnectAttempts = 0;
        this.startFpsCalculation();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
          this.fpsCounter++;
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        useCalibrationStore.getState().setConnected(false);
        // Only reconnect if it wasn't a clean close
        if (event.code !== 1000) {
          this.scheduleReconnect();
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        useCalibrationStore.getState().setConnected(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private handleMessage(data: any) {
    const store = useCalibrationStore.getState();
    
    if (data.topic === 'inference.tap') {
      store.updateInference(data as InferenceData);
    } else if (data.topic === 'tracker.tap') {
      store.updateTracker(data as TrackerData);
    }
  }

  private startFpsCalculation() {
    if (this.fpsInterval) {
      clearInterval(this.fpsInterval);
    }
    
    this.fpsInterval = setInterval(() => {
      const now = Date.now();
      const timeDiff = now - this.lastFpsUpdate;
      const fps = (this.fpsCounter / timeDiff) * 1000;
      
      const store = useCalibrationStore.getState();
      store.metrics.fps = fps;
      
      this.fpsCounter = 0;
      this.lastFpsUpdate = now;
    }, 1000);
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Reconnecting to WebSocket (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.fpsInterval) {
      clearInterval(this.fpsInterval);
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

let wsManager: WebSocketManager | null = null;

export const initializeWebSocket = () => {
  if (!wsManager) {
    wsManager = new WebSocketManager();
  }
  return wsManager;
};

export const disconnectWebSocket = () => {
  if (wsManager) {
    wsManager.disconnect();
    wsManager = null;
  }
};
