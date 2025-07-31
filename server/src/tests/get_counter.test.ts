
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { getCounter } from '../handlers/get_counter';

describe('getCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create and return a counter when none exists', async () => {
    const result = await getCounter();

    // Verify counter properties
    expect(result.id).toBeDefined();
    expect(result.count).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify counter was saved to database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].count).toEqual(0);
    expect(counters[0].id).toEqual(result.id);
  });

  it('should return existing counter when one exists', async () => {
    // Create a counter first
    await db.insert(countersTable)
      .values({
        count: 42
      })
      .execute();

    const result = await getCounter();

    // Should return the existing counter, not create a new one
    expect(result.count).toEqual(42);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify only one counter exists in database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].count).toEqual(42);
  });

  it('should return the first counter when multiple exist', async () => {
    // Create multiple counters
    await db.insert(countersTable)
      .values([
        { count: 10 },
        { count: 20 }
      ])
      .execute();

    const result = await getCounter();

    // Should return one of the counters
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
    expect([10, 20]).toContain(result.count);

    // Verify both counters still exist
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(2);
  });
});
