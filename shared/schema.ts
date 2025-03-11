import { pgTable, text, serial, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the waitlist table schema
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  signupDate: timestamp("signup_date").defaultNow().notNull(),
});

// Create an insert schema for the waitlist
export const insertWaitlistSchema = createInsertSchema(waitlist)
  .pick({ email: true })
  .extend({
    email: z.string().email("Please enter a valid email address"),
  });

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;

// IoT device schema
export const iotDevice = pgTable("iot_device", {
  id: serial("id").primaryKey(),
  deviceEUI: text("device_eui").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  location: jsonb("location").notNull(), // {lat: number, lng: number}
  type: text("type").notNull(), // e.g., 'traffic_sensor', 'environmental_sensor'
  status: text("status").notNull().default('active'),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// IoT data schema with traffic-specific fields
export const iotData = pgTable("iot_data", {
  id: serial("id").primaryKey(),
  deviceId: serial("device_id").references(() => iotDevice.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  trafficLevel: real("traffic_level"), // 0-1 scale of traffic congestion
  vehicleCount: real("vehicle_count"), // number of vehicles detected
  averageSpeed: real("average_speed"), // in km/h
  roadCondition: text("road_condition"), // e.g., 'normal', 'wet', 'icy'
  temperature: real("temperature"), // ambient temperature
  humidity: real("humidity"), // ambient humidity
  batteryLevel: real("battery_level"),
  rssi: real("rssi"), // signal strength
  rawData: jsonb("raw_data"), // additional sensor data
});

// Insert schemas with validation
export const insertIotDeviceSchema = createInsertSchema(iotDevice)
  .pick({ 
    deviceEUI: true, 
    name: true, 
    description: true,
    location: true,
    type: true 
  })
  .extend({
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    type: z.enum(['traffic_sensor', 'environmental_sensor']),
  });

export const insertIotDataSchema = createInsertSchema(iotData)
  .pick({ 
    deviceId: true,
    trafficLevel: true,
    vehicleCount: true,
    averageSpeed: true,
    roadCondition: true,
    temperature: true,
    humidity: true,
    batteryLevel: true,
    rssi: true,
    rawData: true 
  })
  .extend({
    trafficLevel: z.number().min(0).max(1).optional(),
    vehicleCount: z.number().min(0).optional(),
    averageSpeed: z.number().min(0).optional(),
    roadCondition: z.enum(['normal', 'wet', 'icy', 'unknown']).optional(),
  });

export type InsertIotDevice = z.infer<typeof insertIotDeviceSchema>;
export type InsertIotData = z.infer<typeof insertIotDataSchema>;
export type IotDevice = typeof iotDevice.$inferSelect;
export type IotData = typeof iotData.$inferSelect;