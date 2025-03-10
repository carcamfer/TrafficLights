import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistSchema, insertIotDeviceSchema, insertIotDataSchema } from "@shared/schema";
import { ZodError } from "zod";
import { handleLoRaMessage } from "./lorawan";

export async function registerRoutes(app: Express): Promise<Server> {
  // Existing waitlist route
  app.post("/api/waitlist", async (req, res) => {
    try {
      const data = insertWaitlistSchema.parse(req.body);

      const exists = await storage.isEmailRegistered(data.email);
      if (exists) {
        return res.status(409).json({ 
          message: "This email is already registered" 
        });
      }

      const entry = await storage.createWaitlistEntry(data);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: error.errors[0].message 
        });
      }
      throw error;
    }
  });

  // IoT device registration
  app.post("/api/devices", async (req, res) => {
    try {
      const data = insertIotDeviceSchema.parse(req.body);
      const device = await storage.createIotDevice(data);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      throw error;
    }
  });

  // IoT data ingestion
  app.post("/api/data", async (req, res) => {
    try {
      const data = insertIotDataSchema.parse(req.body);

      // Verify device exists before creating data
      const device = await storage.getIotDevice(data.deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      // Store IoT data
      const iotData = await storage.createIotData(data);

      // Process and forward to Waze if location data is present
      if (device.location) {
        await handleLoRaMessage({
          deviceEUI: device.deviceEUI,
          data: iotData,
          location: device.location
        });
      }

      res.status(201).json(iotData);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error processing IoT data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}