import { describe, it, expect } from 'vitest';
import { classifyError, calculateBackoffMs, CircuitBreaker } from '../../src/lib/publishing/resilience';

describe('Publishing Resilience Module', () => {
  it('should correctly classify errors as transient vs permanent', () => {
    expect(classifyError({ status: 429 })).toBe('TRANSIENT');
    expect(classifyError({ message: 'Rate limit exceeded' })).toBe('TRANSIENT');
    expect(classifyError({ message: 'Prohibited policy term' })).toBe('PERMANENT');
  });

  it('should calculate exponential backoff with jitter', () => {
    const ms1 = calculateBackoffMs(1, 1000);
    const ms2 = calculateBackoffMs(2, 1000);
    expect(ms2).toBeGreaterThan(ms1);
  });

  it('should open circuit breaker on consecutive failures', () => {
    const cb = new CircuitBreaker(2, 10000);
    expect(cb.canExecute()).toBe(true);

    cb.recordFailure();
    expect(cb.canExecute()).toBe(true);

    cb.recordFailure();
    expect(cb.canExecute()).toBe(false);
  });
});
