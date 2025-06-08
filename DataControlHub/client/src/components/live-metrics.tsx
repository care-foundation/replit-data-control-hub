import { useMetricsStore } from '../features/metrics/store';
import { useCanvasStore } from '../features/canvas/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LiveMetrics() {
  const { metrics } = useMetricsStore();
  const { currentTracker } = useCanvasStore();

  const getKeypointStatus = () => {
    const criticalKeypoints = ['nose', 'left_hand', 'right_hand', 'left_shoulder', 'right_shoulder'];
    const detectedCount = criticalKeypoints.filter(kp => metrics.criticalKeypoints[kp] > 0.5).length;
    const percentage = (detectedCount / criticalKeypoints.length) * 100;
    
    if (percentage >= 80) return { status: 'OK', color: 'green' };
    if (percentage >= 60) return { status: 'Warning', color: 'yellow' };
    return { status: 'Low', color: 'red' };
  };

  const getRegionStatus = () => {
    if (!currentTracker?.regions) return { status: 'Unknown', color: 'gray' };
    
    const bedOccupied = currentTracker.regions.bed?.occupied;
    const doorCrossed = currentTracker.regions.door?.crossed;
    
    if (bedOccupied) return { status: 'Bed Occupied', color: 'blue' };
    if (doorCrossed) return { status: 'Door Active', color: 'orange' };
    return { status: 'Normal', color: 'green' };
  };

  const keypointStatus = getKeypointStatus();
  const regionStatus = getRegionStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-2xl font-bold font-mono text-foreground">
              {metrics.fps.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">FPS</div>
            <div className="text-xs text-green-600 mt-1">↑ Stable</div>
          </div>
          
          <div className="bg-muted rounded-lg p-3">
            <div className="text-2xl font-bold font-mono text-foreground">
              {metrics.avgConfidence.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Confidence</div>
            <div className="text-xs text-blue-600 mt-1">● Good</div>
          </div>
        </div>

        {/* Detection Counts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Tracks</span>
            <span className="font-mono text-sm font-medium">{metrics.activeTracks}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Detections/Frame</span>
            <span className="font-mono text-sm font-medium">{metrics.detectionsPerFrame.toFixed(1)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Drop Frames</span>
            <span className="font-mono text-sm font-medium text-yellow-600">{metrics.dropFrames.toFixed(1)}%</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">System Status</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Critical Keypoints</span>
            <Badge 
              variant={keypointStatus.color === 'green' ? 'default' : keypointStatus.color === 'yellow' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {keypointStatus.status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Frame Drops</span>
            <Badge 
              variant={metrics.dropFrames < 1 ? 'default' : metrics.dropFrames < 5 ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {metrics.dropFrames < 1 ? 'None' : Math.floor(metrics.dropFrames)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Region Status</span>
            <Badge 
              variant={regionStatus.color === 'green' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {regionStatus.status}
            </Badge>
          </div>
        </div>

        {/* Critical Keypoints Detail */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Keypoint Confidence</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(metrics.criticalKeypoints).map(([name, conf]) => (
              <div key={name} className="flex items-center space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    conf > 0.8 ? 'bg-green-500' : 
                    conf > 0.5 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                />
                <span className="text-muted-foreground capitalize">{name.replace('_', ' ')}</span>
                <span className="font-mono text-foreground ml-auto">{conf.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
