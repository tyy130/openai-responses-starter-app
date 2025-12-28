import { db } from "./db";
import { memories } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getMemoryString(): Promise<string> {
  try {
    const allMemories = await db.select().from(memories);
    if (allMemories.length === 0) return "No previous memory found.";
    
    return allMemories
      .map((m: { key: string; value: string }) => `${m.key}: ${m.value}`)
      .join("\n");
  } catch (error) {
    console.error("Error fetching memory:", error);
    return "Memory system currently unavailable.";
  }
}

export async function updateMemory(key: string, value: string) {
  try {
    await db
      .insert(memories)
      .values({ key, value })
      .onConflictDoUpdate({
        target: memories.key,
        set: { value, updatedAt: new Date() },
      });
    return { success: true };
  } catch (error) {
    console.error("Error updating memory:", error);
    return { success: false, error: "Failed to update memory" };
  }
}
