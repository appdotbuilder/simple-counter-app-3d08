
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput, type Counter } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const incrementCounter = async (input: IncrementCounterInput): Promise<Counter> => {
  try {
    // First, check if a counter exists (assuming we use counter with id = 1)
    const existingCounters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, 1))
      .execute();

    let result;

    if (existingCounters.length === 0) {
      // Create new counter with the increment amount
      result = await db.insert(countersTable)
        .values({
          count: input.amount,
          updated_at: new Date()
        })
        .returning()
        .execute();
    } else {
      // Update existing counter by incrementing the count
      result = await db.update(countersTable)
        .set({
          count: sql`${countersTable.count} + ${input.amount}`,
          updated_at: new Date()
        })
        .where(eq(countersTable.id, 1))
        .returning()
        .execute();
    }

    return result[0];
  } catch (error) {
    console.error('Counter increment failed:', error);
    throw error;
  }
};
