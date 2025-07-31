
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type DecrementCounterInput } from '../schema';
import { decrementCounter } from '../handlers/decrement_counter';

describe('decrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should decrement counter by 1 when no amount specified', async () => {
    // Create initial counter with value 5
    await db.insert(countersTable)
      .values({ count: 5 })
      .execute();

    const input: DecrementCounterInput = { amount: 1 }; // Include amount field with default value
    const result = await decrementCounter(input);

    expect(result.count).toEqual(4);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement counter by specified amount', async () => {
    // Create initial counter with value 10
    await db.insert(countersTable)
      .values({ count: 10 })
      .execute();

    const input: DecrementCounterInput = { amount: 3 };
    const result = await decrementCounter(input);

    expect(result.count).toEqual(7);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create counter if none exists and decrement from 0', async () => {
    const input: DecrementCounterInput = { amount: 2 };
    const result = await decrementCounter(input);

    expect(result.count).toEqual(-2);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify counter was saved to database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].count).toEqual(-2);
  });

  it('should allow counter to go negative', async () => {
    // Create initial counter with value 2
    await db.insert(countersTable)
      .values({ count: 2 })
      .execute();

    const input: DecrementCounterInput = { amount: 5 };
    const result = await decrementCounter(input);

    expect(result.count).toEqual(-3);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update the timestamp when decrementing', async () => {
    // Create initial counter
    const initialCounter = await db.insert(countersTable)
      .values({ count: 10 })
      .returning()
      .execute();

    const originalTimestamp = initialCounter[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: DecrementCounterInput = { amount: 1 };
    const result = await decrementCounter(input);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalTimestamp.getTime());
  });
});
