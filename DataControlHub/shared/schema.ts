import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Inference data schema
export const inferenceDataSchema = z.object({
  topic: z.literal("inference.tap"),
  timestamp: z.number(),
  frame_id: z.number(),
  detections: z.array(z.object({
    person_id: z.number(),
    bbox: z.array(z.number()).length(4),
    keypoints: z.array(z.object({
      name: z.string(),
      x: z.number(),
      y: z.number(),
      conf: z.number()
    })),
    confidence: z.number(),
    imov: z.number()
  }))
});

// Tracker data schema
export const trackerDataSchema = z.object({
  topic: z.literal("tracker.tap"),
  timestamp: z.number(),
  event: z.string().optional(),
  event_payload: z.object({
    person_id: z.number().optional(),
    keypoints_outside: z.array(z.string()).optional(),
    distance_cm: z.number().optional(),
    confidence: z.number().optional(),
    all_keypoints_outside_bed: z.boolean().optional(),
    imov: z.number().optional()
  }).optional(),
  regions: z.object({
    bed: z.object({
      occupied: z.boolean(),
      confidence: z.number(),
      bbox: z.array(z.number()).length(4).optional(),
      keypoints: z.array(z.array(z.number()).length(2)).optional()
    }).optional(),
    door: z.object({
      crossed: z.boolean(),
      bbox: z.array(z.number()).length(4).optional(),
      keypoints: z.array(z.array(z.number()).length(2)).optional()
    }).optional()
  }),
  tracks: z.array(z.object({
    person_id: z.number(),
    bbox_smoothed: z.array(z.number()).length(4),
    keypoints: z.array(z.object({
      name: z.string(),
      x: z.number(),
      y: z.number(),
      conf: z.number()
    })),
    stability: z.number()
  }))
});

export type InferenceData = z.infer<typeof inferenceDataSchema>;
export type TrackerData = z.infer<typeof trackerDataSchema>;
