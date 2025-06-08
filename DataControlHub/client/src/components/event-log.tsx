import { useEventsStore } from '../features/events/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

export function EventLog() {
  const { events, clearEvents } = useEventsStore();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-400 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-400 bg-yellow-50 text-yellow-800';
      case 'success': return 'border-green-400 bg-green-50 text-green-800';
      case 'info':
      default: return 'border-blue-400 bg-blue-50 text-blue-800';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Event Log</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearEvents}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-64 px-6 pb-6">
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">No events logged yet</p>
                <p className="text-xs mt-1">Events will appear here as they occur</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`border-l-4 p-3 rounded-r-lg ${getSeverityColor(event.severity)} animate-in slide-in-from-right-5 duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{event.message}</span>
                        {event.personId && (
                          <Badge variant="outline" className="text-xs">
                            #{event.personId}
                          </Badge>
                        )}
                      </div>
                      {event.details && (
                        <div className="text-xs mt-1 opacity-80">
                          {event.details}
                        </div>
                      )}
                      <div className="text-xs mt-1 font-mono opacity-60">
                        {event.type}
                      </div>
                    </div>
                    <span className="text-xs font-mono opacity-60 ml-2">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
