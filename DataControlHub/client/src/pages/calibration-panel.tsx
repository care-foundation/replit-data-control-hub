import { useEffect } from 'react';
import { dataCoordinator } from '../features/data-coordinator';
import { useConnectionStore } from '../features/connection/store';
import { useCanvasStore } from '../features/canvas/store';
import { useEventsStore } from '../features/events/store';
import { SpatialCanvas } from '../features/canvas/spatial-canvas';
import { LiveMetrics } from '../components/live-metrics';
import { MiniTimeline } from '../components/mini-timeline';
import { EventLog } from '../components/event-log';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, Settings, Download } from 'lucide-react';

export default function CalibrationPanel() {
  const { connected } = useConnectionStore();
  const { currentFrame } = useCanvasStore();
  const { events } = useEventsStore();

  useEffect(() => {
    dataCoordinator.initialize();
    
    return () => {
      dataCoordinator.disconnect();
    };
  }, []);

  const handleExportLog = () => {
    const exportData = {
      timestamp: Date.now(),
      events: events,
      metrics: {}, // TODO: Get from metrics store
      settings: {} // TODO: Get from canvas store
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `calibration-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">Calibration Panel v1.0</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground font-mono">Live Diagnostics</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge 
              variant={connected ? "default" : "destructive"}
              className="flex items-center space-x-2"
            >
              <Wifi className="h-3 w-3" />
              <span>{connected ? 'Connected' : 'Disconnected'}</span>
            </Badge>
            
            <div className="flex items-center space-x-2 px-3 py-1 bg-muted border border-border rounded-lg">
              <span className="text-sm font-mono text-foreground">{currentTime}</span>
            </div>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left Side - Canvas and Timeline */}
          <div className="flex-1 flex flex-col">
            {/* Canvas Visualization */}
            <div className="flex-1 p-6">
              <SpatialCanvas />
            </div>

            {/* Timeline below Canvas */}
            <div className="px-6 pb-6">
              <MiniTimeline />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 xl:w-96 border-l border-border bg-card flex flex-col">
            {/* Live Metrics Panel */}
            <div className="p-6 border-b border-border">
              <LiveMetrics />
            </div>

            {/* Event Log */}
            <div className="flex-1 p-6">
              <EventLog />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <footer className="bg-card border-t border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>Frame:</span>
              <span className="font-mono text-foreground">{currentFrame.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Buffer:</span>
              <span className="font-mono text-foreground">720/720</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Memory:</span>
              <span className="font-mono text-foreground">142MB</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">WebSocket:</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                inference.tap
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                tracker.tap
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportLog}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export Log
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
