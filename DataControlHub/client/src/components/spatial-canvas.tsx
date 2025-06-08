import { useEffect, useRef } from 'react';
import { useCalibrationStore } from '../store/calibration-store';
import { CanvasRenderer } from '../lib/canvas-renderer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, RotateCcw } from 'lucide-react';

export function SpatialCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  
  const {
    currentInference,
    currentTracker,
    currentFrame,
    showRawBbox,
    showSmoothBbox,
    showKeypoints,
    showRegions,
    toggleVisualization
  } = useCalibrationStore();

  useEffect(() => {
    // Add a small delay to ensure container is properly sized
    const initCanvas = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Ensure minimum dimensions to prevent zero width/height
        const width = Math.max(rect.width, 800);
        const height = Math.max(rect.height, 600);
        rendererRef.current = new CanvasRenderer('spatial-canvas', width, height);
      }
    };

    const timer = setTimeout(initCanvas, 100);

    return () => {
      clearTimeout(timer);
      if (rendererRef.current) {
        rendererRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateVisualization(
        currentInference,
        currentTracker,
        {
          showRawBbox,
          showSmoothBbox,
          showKeypoints,
          showRegions
        }
      );
    }
  }, [currentInference, currentTracker, showRawBbox, showSmoothBbox, showKeypoints, showRegions]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && rendererRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.max(rect.width, 800);
        const height = Math.max(rect.height, 600);
        rendererRef.current.resize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className="flex-1 flex flex-col">
      {/* Canvas Controls */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="font-medium text-foreground">Spatial View</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Frame:</span>
              <span className="font-mono text-foreground">{currentFrame.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Visualization toggles */}
            <div className="flex items-center space-x-1 p-1 bg-background border border-border rounded-lg">
              <Button
                variant={showRawBbox ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => toggleVisualization('rawBbox')}
              >
                <Badge variant="outline" className="mr-1 border-red-500 text-red-700">
                  Raw BBox
                </Badge>
              </Button>
              <Button
                variant={showSmoothBbox ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => toggleVisualization('smoothBbox')}
              >
                <Badge variant="outline" className="mr-1 border-green-600 text-green-700">
                  Smooth BBox
                </Badge>
              </Button>
              <Button
                variant={showKeypoints ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => toggleVisualization('keypoints')}
              >
                <Badge variant="outline" className="mr-1 border-yellow-600 text-yellow-700">
                  Keypoints
                </Badge>
              </Button>
              <Button
                variant={showRegions ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => toggleVisualization('regions')}
              >
                <Badge variant="outline" className="mr-1 border-blue-600 text-blue-700">
                  Regions
                </Badge>
              </Button>
            </div>
            
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Maximize2 className="h-3 w-3 mr-1" />
              Fit
            </Button>
            
            <Button variant="outline" size="sm" className="h-7 px-2">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>
      
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-muted/30"
      >
        <div id="spatial-canvas" className="w-full h-full" />
        
        {/* Canvas Legend */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3">
          <div className="text-xs space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-red-500"></div>
              <span className="text-muted-foreground">Raw Detection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-green-600"></div>
              <span className="text-muted-foreground">Smoothed Track</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <span className="text-muted-foreground">Keypoints</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600/20 border border-blue-600"></div>
              <span className="text-muted-foreground">Regions</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
