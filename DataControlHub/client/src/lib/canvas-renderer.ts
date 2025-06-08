import Konva from 'konva';
import { InferenceData, TrackerData } from '../types/inference';

export class CanvasRenderer {
  private stage: Konva.Stage;
  private backgroundLayer: Konva.Layer;
  private dynamicLayer: Konva.Layer;
  private regionGroup: Konva.Group;
  private rawBboxGroup: Konva.Group;
  private smoothBboxGroup: Konva.Group;
  private keypointGroup: Konva.Group;

  constructor(containerId: string, width: number, height: number) {
    this.stage = new Konva.Stage({
      container: containerId,
      width,
      height
    });

    this.backgroundLayer = new Konva.Layer();
    this.dynamicLayer = new Konva.Layer();
    
    this.regionGroup = new Konva.Group({ name: 'regions' });
    this.rawBboxGroup = new Konva.Group({ name: 'rawBbox' });
    this.smoothBboxGroup = new Konva.Group({ name: 'smoothBbox' });
    this.keypointGroup = new Konva.Group({ name: 'keypoints' });

    this.dynamicLayer.add(this.regionGroup);
    this.dynamicLayer.add(this.rawBboxGroup);
    this.dynamicLayer.add(this.smoothBboxGroup);
    this.dynamicLayer.add(this.keypointGroup);

    this.stage.add(this.backgroundLayer);
    this.stage.add(this.dynamicLayer);

    this.initializeBackground();
  }

  private initializeBackground() {
    // Room outline
    const room = new Konva.Rect({
      x: 20,
      y: 20,
      width: this.stage.width() - 40,
      height: this.stage.height() - 40,
      stroke: hsl(220, 13, 60),
      strokeWidth: 2,
      dash: [10, 5],
      fill: 'transparent'
    });
    
    this.backgroundLayer.add(room);
    this.backgroundLayer.draw();
  }

  public updateVisualization(
    inference: InferenceData | null,
    tracker: TrackerData | null,
    settings: {
      showRawBbox: boolean;
      showSmoothBbox: boolean;
      showKeypoints: boolean;
      showRegions: boolean;
    }
  ) {
    // Clear dynamic content
    this.regionGroup.destroyChildren();
    this.rawBboxGroup.destroyChildren();
    this.smoothBboxGroup.destroyChildren();
    this.keypointGroup.destroyChildren();

    // Draw regions
    if (settings.showRegions && tracker) {
      this.drawRegions(tracker);
    }

    // Draw raw bounding boxes
    if (settings.showRawBbox && inference) {
      this.drawRawBoundingBoxes(inference);
    }

    // Draw smoothed bounding boxes
    if (settings.showSmoothBbox && tracker) {
      this.drawSmoothBoundingBoxes(tracker);
    }

    // Draw keypoints
    if (settings.showKeypoints) {
      if (inference) this.drawKeypoints(inference.detections[0]?.keypoints || []);
      if (tracker) this.drawTrackedKeypoints(tracker.tracks);
    }

    this.dynamicLayer.draw();
  }

  private drawRegions(tracker: TrackerData) {
    const { bed, door } = tracker.regions;

    // Draw bed region
    if (bed && bed.keypoints) {
      const bedShape = new Konva.Line({
        points: bed.keypoints.flat(),
        closed: true,
        fill: hsl(207, 90, 54, 0.1),
        stroke: hsl(207, 90, 54),
        strokeWidth: 2
      });
      
      const bedLabel = new Konva.Text({
        x: bed.keypoints[0][0] + 10,
        y: bed.keypoints[0][1] + 10,
        text: `BED ${bed.occupied ? '(OCCUPIED)' : '(EMPTY)'}`,
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
        fill: hsl(207, 90, 54)
      });
      
      this.regionGroup.add(bedShape, bedLabel);
    }

    // Draw door region
    if (door && door.keypoints) {
      const doorShape = new Konva.Line({
        points: door.keypoints.flat(),
        closed: true,
        fill: hsl(271, 91, 65, 0.1),
        stroke: hsl(271, 91, 65),
        strokeWidth: 2
      });
      
      const doorLabel = new Konva.Text({
        x: door.keypoints[0][0] + 10,
        y: door.keypoints[0][1] + 10,
        text: 'DOOR',
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
        fill: hsl(271, 91, 65)
      });
      
      this.regionGroup.add(doorShape, doorLabel);
    }
  }

  private drawRawBoundingBoxes(inference: InferenceData) {
    inference.detections.forEach((detection, index) => {
      const [x, y, w, h] = detection.bbox;
      
      const bbox = new Konva.Rect({
        x,
        y,
        width: w,
        height: h,
        stroke: hsl(0, 84, 60),
        strokeWidth: 2,
        fill: 'transparent'
      });
      
      const label = new Konva.Text({
        x: x,
        y: y - 20,
        text: `Person #${detection.person_id} (${detection.confidence.toFixed(2)})`,
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fill: hsl(0, 84, 60),
        fontStyle: 'bold'
      });
      
      this.rawBboxGroup.add(bbox, label);
    });
  }

  private drawSmoothBoundingBoxes(tracker: TrackerData) {
    tracker.tracks.forEach(track => {
      const [x, y, w, h] = track.bbox_smoothed;
      
      const bbox = new Konva.Rect({
        x,
        y,
        width: w,
        height: h,
        stroke: hsl(142, 76, 36),
        strokeWidth: 2,
        fill: 'transparent'
      });
      
      const label = new Konva.Text({
        x: x,
        y: y - 20,
        text: `Track #${track.person_id} (${track.stability.toFixed(2)})`,
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fill: hsl(142, 76, 36),
        fontStyle: 'bold'
      });
      
      this.smoothBboxGroup.add(bbox, label);
    });
  }

  private drawKeypoints(keypoints: any[]) {
    keypoints.forEach(kp => {
      const keypoint = new Konva.Circle({
        x: kp.x,
        y: kp.y,
        radius: 4,
        fill: hsl(45, 93, 47),
        opacity: kp.conf,
        stroke: hsl(45, 93, 35),
        strokeWidth: 1
      });
      
      this.keypointGroup.add(keypoint);
    });
  }

  private drawTrackedKeypoints(tracks: any[]) {
    tracks.forEach(track => {
      track.keypoints.forEach((kp: any) => {
        const keypoint = new Konva.Circle({
          x: kp.x,
          y: kp.y,
          radius: 5,
          fill: hsl(45, 93, 47),
          opacity: kp.conf,
          stroke: hsl(142, 76, 36),
          strokeWidth: 2
        });
        
        this.keypointGroup.add(keypoint);
      });
    });
  }

  public resize(width: number, height: number) {
    this.stage.size({ width, height });
    
    // Update background
    this.backgroundLayer.destroyChildren();
    this.initializeBackground();
  }

  public destroy() {
    this.stage.destroy();
  }
}

// Helper function to convert HSL values to CSS string
function hsl(h: number, s: number, l: number, a?: number): string {
  return a !== undefined ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `hsl(${h}, ${s}%, ${l}%)`;
}
