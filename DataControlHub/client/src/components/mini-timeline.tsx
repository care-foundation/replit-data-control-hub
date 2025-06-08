import { useTimelineStore } from '../features/timeline/store';
import { useMetricsStore } from '../features/metrics/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MiniTimeline() {
  const { timelineData } = useTimelineStore();
  const { metrics } = useMetricsStore();

  const renderHistogram = (data: number[], color: string, maxValue?: number) => {
    const max = maxValue || Math.max(...data, 1);
    
    return (
      <div className="h-8 bg-muted rounded overflow-hidden">
        <div className="h-full flex items-end space-x-0.5 px-1">
          {data.map((value, index) => (
            <div
              key={index}
              className={`flex-1 rounded-t transition-all duration-300`}
              style={{
                height: `${(value / max) * 100}%`,
                backgroundColor: color,
                opacity: 0.8 + (value / max) * 0.2
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline (2m)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Timeline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Confidence</span>
            <span className="text-sm font-mono text-foreground">
              {metrics.avgConfidence.toFixed(2)}
            </span>
          </div>
          {renderHistogram(timelineData.confidence, 'hsl(207, 90%, 54%)', 1)}
        </div>

        {/* Detection Count Timeline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Detections/Frame</span>
            <span className="text-sm font-mono text-foreground">
              {metrics.detectionsPerFrame.toFixed(1)}
            </span>
          </div>
          {renderHistogram(timelineData.detections, 'hsl(142, 76%, 36%)', 5)}
        </div>

        {/* Critical Keypoints Timeline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Critical Keypoints</span>
            <span className="text-sm font-mono text-foreground">
              {(timelineData.keypoints[timelineData.keypoints.length - 1] * 100).toFixed(0)}%
            </span>
          </div>
          {renderHistogram(timelineData.keypoints, 'hsl(45, 93%, 47%)', 1)}
        </div>
      </CardContent>
    </Card>
  );
}
