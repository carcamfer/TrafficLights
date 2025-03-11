import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWaitlistSchema, insertIotDeviceSchema, insertIotDataSchema } from "@shared/schema";
import { ZodError } from "zod";
import { initializeLoRaWAN } from "./services/lorawan";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize LoRaWAN connection without blocking server startup
  initializeLoRaWAN().catch(error => {
    console.error('Failed to initialize LoRaWAN:', error);
    console.log('Server will continue running without LoRaWAN connection');
  });

  // Waitlist route
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

  // IoT Routes
  // List all IoT devices
  app.get("/api/devices", async (_req, res) => {
    try {
      const devices = await storage.listIotDevices();
      res.json(devices);
    } catch (error) {
      console.error('Error listing devices:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get specific IoT device
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

  // Register new IoT device
  app.post("/api/devices", async (req, res) => {
    try {
      const data = insertIotDeviceSchema.parse(req.body);
      const device = await storage.createIotDevice(data);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error creating device:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get device data history
  app.get("/api/devices/:id/data", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid device ID" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const data = await storage.getIotDataHistory(id, limit);
      res.json(data);
    } catch (error) {
      console.error('Error fetching device data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Manual data ingestion endpoint (for testing)
  app.post("/api/devices/:id/data", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      if (isNaN(deviceId)) {
        return res.status(400).json({ message: "Invalid device ID" });
      }

      const device = await storage.getIotDevice(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      const data = insertIotDataSchema.parse({ ...req.body, deviceId });
      const savedData = await storage.createIotData(data);
      res.status(201).json(savedData);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error creating device data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}