import { type Waitlist, type InsertWaitlist } from "@shared/schema";

export interface IStorage {
  createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist>;
  isEmailRegistered(email: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private waitlist: Map<number, Waitlist>;
  currentId: number;

  constructor() {
    this.waitlist = new Map();
    this.currentId = 1;
  }

  async createWaitlistEntry(insertEntry: InsertWaitlist): Promise<Waitlist> {
    const id = this.currentId++;
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
}

export const storage = new MemStorage();
