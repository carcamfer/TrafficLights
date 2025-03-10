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

  // Get all IoT devices
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getAllIotDevices();
      res.json(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get a specific IoT device
  app.get("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid device ID" });
      }
      
      const device = await storage.getIotDevice(id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      console.error('Error fetching device:', error);
      res.status(500).json({ message: 'Internal server error' });
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

  // Get IoT data for a device
  app.get("/api/data", async (req, res) => {
    try {
      const deviceId = req.query.deviceId ? parseInt(req.query.deviceId as string) : undefined;
      if (deviceId === undefined) {
        return res.status(400).json({ message: "Device ID is required" });
      }
      
      if (isNaN(deviceId)) {
        return res.status(400).json({ message: "Invalid device ID" });
      }
      
      const data = await storage.getIotDataByDeviceId(deviceId);
      res.json(data);
    } catch (error) {
      console.error('Error fetching device data:', error);
      res.status(500).json({ message: 'Internal server error' });
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