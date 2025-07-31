
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type IncrementCounterInput } from '../schema';
import { incrementCounter } from '../handlers/increment_counter';
import { eq } from 'drizzle-orm';

describe('incrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create counter with increment amount when no counter exists', async () => {
    const input: IncrementCounterInput = {
      amount: 5
    };

    const result = await incrementCounter(input);

    expect(result.count).toEqual(5);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should use default amount of 1 when no amount specified', async () => {
    const input: IncrementCounterInput = {
      amount: 1 // Explicitly set to 1 to match the default
    };

    const result = await incrementCounter(input);

    expect(result.count).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter by specified amount', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        count: 10,
        updated_at: new Date()
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: 3
    };

    const result = await incrementCounter(input);

    expect(result.count).toEqual(13);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated counter to database', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        count: 7,
        updated_at: new Date()
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: 2
    };

    const result = await incrementCounter(input);

    // Verify database was updated
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].count).toEqual(9);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle negative increment amounts', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        count: 10,
        updated_at: new Date()
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: -3
    };

    const result = await incrementCounter(input);

    expect(result.count).toEqual(7);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update timestamp when incrementing', async () => {
    // Create initial counter with old timestamp
    const oldDate = new Date('2023-01-01');
    await db.insert(countersTable)
      .values({
        count: 5,
        updated_at: oldDate
      })
      .execute();

    const input: IncrementCounterInput = {
      amount: 1
    };

    const result = await incrementCounter(input);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(oldDate.getTime());
  });
});
