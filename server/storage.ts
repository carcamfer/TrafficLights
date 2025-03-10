import { type Waitlist, type InsertWaitlist, type IotDevice, type InsertIotDevice, type IotData, type InsertIotData } from "@shared/schema";

export interface IStorage {
  createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist>;
  isEmailRegistered(email: string): Promise<boolean>;
  createIotDevice(device: InsertIotDevice): Promise<IotDevice>;
  getIotDevice(id: number): Promise<IotDevice | null>;
  createIotData(data: InsertIotData): Promise<IotData>;
}

export class MemStorage implements IStorage {
  private waitlist: Map<number, Waitlist>;
  private iotDevices: Map<number, IotDevice>;
  private iotData: Map<number, IotData>;
  private currentId: { [key: string]: number };

  constructor() {
    this.waitlist = new Map();
    this.iotDevices = new Map();
    this.iotData = new Map();
    this.currentId = {
      waitlist: 1,
      iotDevice: 1,
      iotData: 1
    };
  }

  async createWaitlistEntry(insertEntry: InsertWaitlist): Promise<Waitlist> {
    const id = this.currentId.waitlist++;
    const entry: Waitlist = {
      ...insertEntry,
      id,
      signupDate: new Date(),
    };
    this.waitlist.set(id, entry);
    return entry;
  }

  async isEmailRegistered(email: string): Promise<boolean> {
    return Array.from(this.waitlist.values()).some(
      (entry) => entry.email === email
    );
  }

  async createIotDevice(insertDevice: InsertIotDevice): Promise<IotDevice> {
    const id = this.currentId.iotDevice++;
    const device: IotDevice = {
      ...insertDevice,
      id,
      createdAt: new Date(),
    };
    this.iotDevices.set(id, device);
    return device;
  }

  async getIotDevice(id: number): Promise<IotDevice | null> {
    return this.iotDevices.get(id) || null;
  }

  async createIotData(insertData: InsertIotData): Promise<IotData> {
    const id = this.currentId.iotData++;
    const data: IotData = {
      id,
      deviceId: insertData.deviceId,
      temperature: insertData.temperature ?? null,
      humidity: insertData.humidity ?? null,
      batteryLevel: insertData.batteryLevel ?? null,
      rssi: insertData.rssi ?? null,
      timestamp: new Date(),
      rawData: insertData.rawData ?? null,
    };
    this.iotData.set(id, data);
    return data;
  }
}

export const storage = new MemStorage();