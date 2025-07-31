
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type DecrementCounterInput, type Counter } from '../schema';
import { sql } from 'drizzle-orm';

export const decrementCounter = async (input: DecrementCounterInput): Promise<Counter> => {
  try {
    // First, ensure a counter exists (create one if it doesn't)
    const existingCounters = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    if (existingCounters.length === 0) {
      // Create initial counter with value 0, then decrement
      await db.insert(countersTable)
        .values({ count: 0 })
        .execute();
    }

    // Decrement the counter by the specified amount
    const result = await db.update(countersTable)
      .set({ 
        count: sql`${countersTable.count} - ${input.amount}`,
        updated_at: new Date()
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Counter decrement failed:', error);
    throw error;
  }
};
