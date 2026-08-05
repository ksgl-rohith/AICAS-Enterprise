export type ErrorCategory = 'TRANSIENT' | 'PERMANENT';

export function classifyError(error: any): ErrorCategory {
  const msg = (error?.message || String(error)).toLowerCase();
  const status = error?.status || error?.statusCode;

  // Rate limits, timeouts, temporary 5xx errors -> TRANSIENT
  if (
    status === 429 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    msg.includes('rate limit') ||
    msg.includes('timeout') ||
    msg.includes('socket hang up') ||
    msg.includes('econnreset') ||
    msg.includes('network')
  ) {
    return 'TRANSIENT';
  }

  // 400 bad request, 401 unauthorized policy, prohibited terms -> PERMANENT
  return 'PERMANENT';
}

export function calculateBackoffMs(attempt: number, initialMs = 1000, maxMs = 60000): number {
  const exponential = Math.min(maxMs, initialMs * Math.pow(2, attempt - 1));
  const jitter = Math.random() * 0.3 * exponential; // 30% jitter
  return Math.round(exponential + jitter);
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold = 5,
    private resetTimeoutMs = 30000
  ) {}

  public canExecute(): boolean {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    return true;
  }

  public recordSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  public recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  public getState() {
    return this.state;
  }
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens = 10,
    private refillRatePerSec = 2
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  public tryAcquire(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsedSec * this.refillRatePerSec);
    this.lastRefill = now;
  }
}
