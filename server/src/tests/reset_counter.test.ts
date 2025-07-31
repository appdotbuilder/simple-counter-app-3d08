
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type ResetCounterInput } from '../schema';
import { resetCounter } from '../handlers/reset_counter';
import { eq } from 'drizzle-orm';

describe('resetCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should reset counter to default value of 0', async () => {
    const input: ResetCounterInput = { value: 0 };
    
    const result = await resetCounter(input);

    expect(result.count).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should reset counter to specified value', async () => {
    const input: ResetCounterInput = { value: 42 };
    
    const result = await resetCounter(input);

    expect(result.count).toEqual(42);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create new counter if none exists', async () => {
    const input: ResetCounterInput = { value: 5 };
    
    const result = await resetCounter(input);

    // Verify counter was created in database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].count).toEqual(5);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update existing counter', async () => {
    // Create an initial counter
    await db.insert(countersTable)
      .values({ count: 100 })
      .execute();

    const input: ResetCounterInput = { value: 10 };
    
    const result = await resetCounter(input);

    expect(result.count).toEqual(10);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify only one counter exists in database
    const allCounters = await db.select()
      .from(countersTable)
      .execute();

    expect(allCounters).toHaveLength(1);
    expect(allCounters[0].count).toEqual(10);
  });

  it('should use default value when value not provided', async () => {
    const input: ResetCounterInput = { value: 0 };
    
    const result = await resetCounter(input);

    expect(result.count).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle negative reset values', async () => {
    const input: ResetCounterInput = { value: -15 };
    
    const result = await resetCounter(input);

    expect(result.count).toEqual(-15);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});
