interface HitRecord {
  count: number;
  resetAt: number;
}

const records = new Map<string, HitRecord>();
let lastCleanup = 0;

export function consumeRateLimit(key: string, limit = 8, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  if (now - lastCleanup > windowMs) {
    for (const [recordKey, value] of records) {
      if (value.resetAt <= now) records.delete(recordKey);
    }
    lastCleanup = now;
  }

  const current = records.get(key);
  if (!current || current.resetAt <= now) {
    records.set(key, {count: 1, resetAt: now + windowMs});
    return {allowed: true, remaining: limit - 1};
  }

  if (current.count >= limit) return {allowed: false, remaining: 0};
  current.count += 1;
  return {allowed: true, remaining: limit - current.count};
}
