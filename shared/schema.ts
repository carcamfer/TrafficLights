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

// Define the IoT device table schema
export const iotDevice = pgTable("iot_device", {
  id: serial("id").primaryKey(),
  deviceEUI: text("device_eui").notNull().unique(),
  name: text("name").notNull(),
  location: jsonb("location").notNull(), // {lat: number, lng: number}
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the IoT data table schema
export const iotData = pgTable("iot_data", {
  id: serial("id").primaryKey(),
  deviceId: serial("device_id").references(() => iotDevice.id),
  temperature: real("temperature"),
  humidity: real("humidity"),
  batteryLevel: real("battery_level"),
  rssi: real("rssi"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  rawData: jsonb("raw_data"),
});

// Create insert schemas
export const insertIotDeviceSchema = createInsertSchema(iotDevice)
  .pick({ deviceEUI: true, name: true, location: true })
  .extend({
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  });

export const insertIotDataSchema = createInsertSchema(iotData)
  .pick({ deviceId: true, temperature: true, humidity: true, batteryLevel: true, rssi: true, rawData: true });

export type InsertIotDevice = z.infer<typeof insertIotDeviceSchema>;
export type InsertIotData = z.infer<typeof insertIotDataSchema>;
export type IotDevice = typeof iotDevice.$inferSelect;
export type IotData = typeof iotData.$inferSelect;