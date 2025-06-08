import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server on /ws path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Realistic room scenario: 4m deep room, camera at foot of bed, 65° angle, 3m height
    // Bed positioned in upper right area, door at bottom left
    // Camera perspective: looking from bottom towards top-right where bed is located
    
    let scenarioTime = 0; // Simulate a 3-minute scenario
    let frameCounter = 4000;
    
    const generateRealisticScenario = () => {
      scenarioTime += 1/6; // 6 FPS = 1/6 second increments
      frameCounter++;
      
      const currentTime = scenarioTime;
      let detections = [];
      let event = null;
      let event_payload = null;
      
      // Scenario phases:
      // 0-15s: Two people enter room
      // 15-45s: Person 1 approaches bed, Person 2 near door
      // 45-75s: Person 1 lies down, Person 2 leaves
      // 75-120s: Person 1 alone in bed
      // 120-180s: Person 1 gets up occasionally
      
      if (currentTime < 15) {
        // Phase 1: Two people entering from door area (bottom left)
        detections = [
          {
            person_id: 1,
            bbox: [180 + currentTime * 8, 500 - currentTime * 12, 120, 280],
            keypoints: [
              { name: "nose", x: 240 + currentTime * 8, y: 520 - currentTime * 12, conf: 0.85 },
              { name: "left_shoulder", x: 220 + currentTime * 8, y: 550 - currentTime * 12, conf: 0.82 },
              { name: "right_shoulder", x: 260 + currentTime * 8, y: 550 - currentTime * 12, conf: 0.80 },
              { name: "left_hand", x: 200 + currentTime * 8, y: 620 - currentTime * 12, conf: 0.75 },
              { name: "right_hand", x: 280 + currentTime * 8, y: 620 - currentTime * 12, conf: 0.78 },
              { name: "left_hip", x: 225 + currentTime * 8, y: 680 - currentTime * 12, conf: 0.88 },
              { name: "right_hip", x: 255 + currentTime * 8, y: 680 - currentTime * 12, conf: 0.86 }
            ],
            confidence: 0.83,
            imov: 0.45
          },
          {
            person_id: 2,
            bbox: [120 + currentTime * 6, 520 - currentTime * 8, 110, 270],
            keypoints: [
              { name: "nose", x: 175 + currentTime * 6, y: 540 - currentTime * 8, conf: 0.81 },
              { name: "left_shoulder", x: 155 + currentTime * 6, y: 570 - currentTime * 8, conf: 0.79 },
              { name: "right_shoulder", x: 195 + currentTime * 6, y: 570 - currentTime * 8, conf: 0.77 },
              { name: "left_hand", x: 135 + currentTime * 6, y: 640 - currentTime * 8, conf: 0.72 },
              { name: "right_hand", x: 215 + currentTime * 6, y: 640 - currentTime * 8, conf: 0.74 },
              { name: "left_hip", x: 160 + currentTime * 6, y: 700 - currentTime * 8, conf: 0.85 },
              { name: "right_hip", x: 190 + currentTime * 6, y: 700 - currentTime * 8, conf: 0.83 }
            ],
            confidence: 0.79,
            imov: 0.38
          }
        ];
        event = "person_detected";
        event_payload = { person_id: 1, confidence: 0.83 };
        
      } else if (currentTime < 45) {
        // Phase 2: Person 1 moving towards bed, Person 2 near door
        const bedProgress = (currentTime - 15) / 30;
        detections = [
          {
            person_id: 1,
            bbox: [300 + bedProgress * 150, 320 - bedProgress * 80, 130, 290],
            keypoints: [
              { name: "nose", x: 365 + bedProgress * 150, y: 340 - bedProgress * 80, conf: 0.87 },
              { name: "left_shoulder", x: 345 + bedProgress * 150, y: 370 - bedProgress * 80, conf: 0.85 },
              { name: "right_shoulder", x: 385 + bedProgress * 150, y: 370 - bedProgress * 80, conf: 0.83 },
              { name: "left_hand", x: 325 + bedProgress * 150, y: 440 - bedProgress * 80, conf: 0.78 },
              { name: "right_hand", x: 405 + bedProgress * 150, y: 440 - bedProgress * 80, conf: 0.80 },
              { name: "left_hip", x: 350 + bedProgress * 150, y: 500 - bedProgress * 80, conf: 0.89 },
              { name: "right_hip", x: 380 + bedProgress * 150, y: 500 - bedProgress * 80, conf: 0.87 }
            ],
            confidence: 0.85,
            imov: 0.25
          },
          {
            person_id: 2,
            bbox: [150 + Math.sin(currentTime) * 20, 480 + Math.cos(currentTime) * 15, 115, 275],
            keypoints: [
              { name: "nose", x: 208 + Math.sin(currentTime) * 20, y: 500 + Math.cos(currentTime) * 15, conf: 0.82 },
              { name: "left_shoulder", x: 188 + Math.sin(currentTime) * 20, y: 530 + Math.cos(currentTime) * 15, conf: 0.80 },
              { name: "right_shoulder", x: 228 + Math.sin(currentTime) * 20, y: 530 + Math.cos(currentTime) * 15, conf: 0.78 },
              { name: "left_hand", x: 168 + Math.sin(currentTime) * 20, y: 600 + Math.cos(currentTime) * 15, conf: 0.73 },
              { name: "right_hand", x: 248 + Math.sin(currentTime) * 20, y: 600 + Math.cos(currentTime) * 15, conf: 0.75 },
              { name: "left_hip", x: 193 + Math.sin(currentTime) * 20, y: 660 + Math.cos(currentTime) * 15, conf: 0.84 },
              { name: "right_hip", x: 223 + Math.sin(currentTime) * 20, y: 660 + Math.cos(currentTime) * 15, conf: 0.82 }
            ],
            confidence: 0.80,
            imov: 0.15
          }
        ];
        
      } else if (currentTime < 75) {
        // Phase 3: Person 1 getting into bed, Person 2 leaving
        const layingProgress = (currentTime - 45) / 30;
        detections = [
          {
            person_id: 1,
            bbox: [450 + layingProgress * 20, 240 + layingProgress * 40, 180 - layingProgress * 50, 290 - layingProgress * 100],
            keypoints: [
              { name: "nose", x: 520 + layingProgress * 20, y: 260 + layingProgress * 50, conf: 0.89 },
              { name: "left_shoulder", x: 500 + layingProgress * 25, y: 280 + layingProgress * 60, conf: 0.87 },
              { name: "right_shoulder", x: 540 + layingProgress * 15, y: 280 + layingProgress * 60, conf: 0.85 },
              { name: "left_hand", x: 480 + layingProgress * 30, y: 320 + layingProgress * 70, conf: 0.82 },
              { name: "right_hand", x: 560 + layingProgress * 10, y: 320 + layingProgress * 70, conf: 0.84 },
              { name: "left_hip", x: 505 + layingProgress * 22, y: 380 + layingProgress * 80, conf: 0.91 },
              { name: "right_hip", x: 535 + layingProgress * 18, y: 380 + layingProgress * 80, conf: 0.89 }
            ],
            confidence: 0.87,
            imov: 0.08 + layingProgress * 0.02
          }
        ];
        
        if (currentTime > 60) {
          event = "bed_occupied";
          event_payload = { person_id: 1, confidence: 0.91 };
        }
        
      } else if (currentTime < 120) {
        // Phase 4: Person 1 lying in bed
        detections = [
          {
            person_id: 1,
            bbox: [470, 280, 130, 190],
            keypoints: [
              { name: "nose", x: 540, y: 310, conf: 0.91 },
              { name: "left_shoulder", x: 525, y: 340, conf: 0.89 },
              { name: "right_shoulder", x: 555, y: 340, conf: 0.87 },
              { name: "left_hand", x: 510 + Math.sin(currentTime * 0.1) * 25, y: 390 + Math.cos(currentTime * 0.1) * 15, conf: 0.85 },
              { name: "right_hand", x: 570 + Math.sin(currentTime * 0.15) * 20, y: 390 + Math.cos(currentTime * 0.15) * 12, conf: 0.87 },
              { name: "left_hip", x: 527, y: 420, conf: 0.93 },
              { name: "right_hip", x: 553, y: 420, conf: 0.91 }
            ],
            confidence: 0.90,
            imov: 0.05
          }
        ];
        
        // Occasional limb outside bed
        if (Math.sin(currentTime * 0.3) > 0.7) {
          detections[0].keypoints[3].x = 440; // left hand outside bed
          event = "limb_outside_bed";
          event_payload = {
            person_id: 1,
            keypoints_outside: ["left_hand"],
            distance_cm: 35,
            confidence: 0.85
          };
        }
        
      } else {
        // Phase 5: Person 1 occasionally moving in bed
        const restlessness = Math.sin(currentTime * 0.2) * 0.3;
        detections = [
          {
            person_id: 1,
            bbox: [470 + restlessness * 30, 280 + restlessness * 20, 130, 190 + restlessness * 40],
            keypoints: [
              { name: "nose", x: 540 + restlessness * 30, y: 310 + restlessness * 20, conf: 0.88 },
              { name: "left_shoulder", x: 525 + restlessness * 32, y: 340 + restlessness * 22, conf: 0.86 },
              { name: "right_shoulder", x: 555 + restlessness * 28, y: 340 + restlessness * 22, conf: 0.84 },
              { name: "left_hand", x: 510 + restlessness * 40, y: 390 + restlessness * 30, conf: 0.82 },
              { name: "right_hand", x: 570 + restlessness * 35, y: 390 + restlessness * 30, conf: 0.84 },
              { name: "left_hip", x: 527 + restlessness * 30, y: 420 + restlessness * 25, conf: 0.90 },
              { name: "right_hip", x: 553 + restlessness * 30, y: 420 + restlessness * 25, conf: 0.88 }
            ],
            confidence: 0.86,
            imov: Math.abs(restlessness) * 0.4
          }
        ];
        
        if (Math.abs(restlessness) > 0.25) {
          event = "tracking_instability";
          event_payload = { person_id: 1, imov: Math.abs(restlessness) * 0.4 };
        }
      }
      
      return { detections, event, event_payload, frameCounter };
    };
    
    const generateMockInference = () => {
      const scenario = generateRealisticScenario();
      return {
        topic: "inference.tap",
        timestamp: Date.now(),
        frame_id: scenario.frameCounter,
        detections: scenario.detections
      };
    };
    
    const generateMockTracker = () => {
      const scenario = generateRealisticScenario();
      const currentTime = scenarioTime;
      
      // Determine bed occupancy based on scenario phase
      let bedOccupied = false;
      let doorCrossed = false;
      
      if (currentTime >= 60) {
        bedOccupied = true;
      }
      
      if (currentTime < 15 || (currentTime >= 45 && currentTime < 75)) {
        doorCrossed = true;
      }
      
      return {
        topic: "tracker.tap",
        timestamp: Date.now(),
        event: scenario.event,
        event_payload: scenario.event_payload,
        regions: {
          bed: {
            occupied: bedOccupied,
            confidence: 0.92,
            bbox: [450, 240, 200, 180],
            keypoints: [[450, 240], [650, 240], [650, 420], [450, 420]]
          },
          door: {
            crossed: doorCrossed,
            bbox: [50, 450, 120, 200],
            keypoints: [[50, 450], [170, 450], [170, 650], [50, 650]]
          }
        },
        tracks: scenario.detections.map(detection => ({
          person_id: detection.person_id,
          bbox_smoothed: detection.bbox,
          keypoints: detection.keypoints,
          stability: 0.85 + (1 - detection.imov) * 0.15
        }))
      };
    };
    
    // Send mock data at 6 FPS
    const dataInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        // Send inference data
        ws.send(JSON.stringify(generateMockInference()));
        
        // Occasionally send tracker data
        if (Math.random() > 0.7) {
          ws.send(JSON.stringify(generateMockTracker()));
        }
      }
    }, 1000 / 6); // 6 FPS
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clearInterval(dataInterval);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(dataInterval);
    });
  });

  return httpServer;
}
