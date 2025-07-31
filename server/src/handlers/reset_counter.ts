
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type ResetCounterInput, type Counter } from '../schema';
import { eq } from 'drizzle-orm';

export const resetCounter = async (input: ResetCounterInput): Promise<Counter> => {
  try {
    // Check if counter exists
    const existingCounters = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    if (existingCounters.length === 0) {
      // Create new counter if none exists
      const result = await db.insert(countersTable)
        .values({
          count: input.value,
          updated_at: new Date()
        })
        .returning()
        .execute();

      return result[0];
    } else {
      // Update existing counter
      const result = await db.update(countersTable)
        .set({
          count: input.value,
          updated_at: new Date()
        })
        .where(eq(countersTable.id, existingCounters[0].id))
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Counter reset failed:', error);
    throw error;
  }
};
