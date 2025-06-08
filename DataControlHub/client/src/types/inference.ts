export interface Keypoint {
  name: string;
  x: number;
  y: number;
  conf: number;
}

export interface Detection {
  person_id: number;
  bbox: [number, number, number, number];
  keypoints: Keypoint[];
  confidence: number;
  imov: number;
}

export interface InferenceData {
  topic: "inference.tap";
  timestamp: number;
  frame_id: number;
  detections: Detection[];
}

export interface Region {
  occupied?: boolean;
  crossed?: boolean;
  confidence: number;
  bbox?: [number, number, number, number];
  keypoints?: [number, number][];
}

export interface Track {
  person_id: number;
  bbox_smoothed: [number, number, number, number];
  keypoints: Keypoint[];
  stability: number;
}

export interface TrackerData {
  topic: "tracker.tap";
  timestamp: number;
  event?: string;
  event_payload?: {
    person_id?: number;
    keypoints_outside?: string[];
    distance_cm?: number;
    confidence?: number;
    all_keypoints_outside_bed?: boolean;
    imov?: number;
  };
  regions: {
    bed?: Region;
    door?: Region;
  };
  tracks: Track[];
}

export interface SystemMetrics {
  fps: number;
  avgConfidence: number;
  activeTracks: number;
  detectionsPerFrame: number;
  dropFrames: number;
  criticalKeypoints: Record<string, number>;
}

export interface EventLogEntry {
  id: string;
  timestamp: number;
  type: string;
  personId?: number;
  message: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface TimelineData {
  confidence: number[];
  detections: number[];
  keypoints: number[];
}
