import { 
  type Waitlist, 
  type InsertWaitlist,
  type IotDevice,
  type InsertIotDevice,
  type IotData,
  type InsertIotData 
} from "@shared/schema";

export interface IStorage {
  // Waitlist methods
  createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist>;
  isEmailRegistered(email: string): Promise<boolean>;

  // IoT device methods
  createIotDevice(device: InsertIotDevice): Promise<IotDevice>;
  getIotDevice(id: number): Promise<IotDevice | null>;
  getIotDeviceByEUI(deviceEUI: string): Promise<IotDevice | null>;
  updateDeviceLastSeen(id: number): Promise<void>;
  listIotDevices(): Promise<IotDevice[]>;

  // IoT data methods
  createIotData(data: InsertIotData): Promise<IotData>;
  getLatestIotData(deviceId: number): Promise<IotData | null>;
  getIotDataHistory(deviceId: number, limit: number): Promise<IotData[]>;
}

export class MemStorage implements IStorage {
  private waitlist: Map<number, Waitlist>;
  private iotDevices: Map<number, IotDevice>;
  private iotDevicesByEUI: Map<string, IotDevice>;
  private iotData: Map<number, IotData>;
  private currentIds: {
    waitlist: number;
    iotDevice: number;
    iotData: number;
  };

  constructor() {
    this.waitlist = new Map();
    this.iotDevices = new Map();
    this.iotDevicesByEUI = new Map();
    this.iotData = new Map();
    this.currentIds = {
      waitlist: 1,
      iotDevice: 1,
      iotData: 1
    };
  }

  async createWaitlistEntry(insertEntry: InsertWaitlist): Promise<Waitlist> {
    const id = this.currentIds.waitlist++;
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
    const id = this.currentIds.iotDevice++;
    const device: IotDevice = {
      id,
      deviceEUI: insertDevice.deviceEUI,
      name: insertDevice.name,
      description: insertDevice.description ?? null,
      location: insertDevice.location,
      type: insertDevice.type,
      status: 'active',
      lastSeen: new Date(),
      createdAt: new Date(),
    };
    this.iotDevices.set(id, device);
    this.iotDevicesByEUI.set(device.deviceEUI, device);
    return device;
  }

  async getIotDevice(id: number): Promise<IotDevice | null> {
    return this.iotDevices.get(id) || null;
  }

  async getIotDeviceByEUI(deviceEUI: string): Promise<IotDevice | null> {
    return this.iotDevicesByEUI.get(deviceEUI) || null;
  }

  async updateDeviceLastSeen(id: number): Promise<void> {
    const device = await this.getIotDevice(id);
    if (device) {
      device.lastSeen = new Date();
      this.iotDevices.set(id, device);
      this.iotDevicesByEUI.set(device.deviceEUI, device);
    }
  }

  async listIotDevices(): Promise<IotDevice[]> {
    return Array.from(this.iotDevices.values());
  }

  async createIotData(insertData: InsertIotData): Promise<IotData> {
    const id = this.currentIds.iotData++;
    const data: IotData = {
      id,
      deviceId: insertData.deviceId,
      timestamp: new Date(),
      trafficLevel: insertData.trafficLevel ?? null,
      vehicleCount: insertData.vehicleCount ?? null,
      averageSpeed: insertData.averageSpeed ?? null,
      roadCondition: insertData.roadCondition ?? null,
      temperature: insertData.temperature ?? null,
      humidity: insertData.humidity ?? null,
      batteryLevel: insertData.batteryLevel ?? null,
      rssi: insertData.rssi ?? null,
      rawData: insertData.rawData ?? null,
    };
    this.iotData.set(id, data);
    await this.updateDeviceLastSeen(data.deviceId);
    return data;
  }

  async getLatestIotData(deviceId: number): Promise<IotData | null> {
    const deviceData = Array.from(this.iotData.values())
      .filter(data => data.deviceId === deviceId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return deviceData[0] || null;
  }

  async getIotDataHistory(deviceId: number, limit: number): Promise<IotData[]> {
    return Array.from(this.iotData.values())
      .filter(data => data.deviceId === deviceId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();