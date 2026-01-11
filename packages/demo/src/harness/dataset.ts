/**
 * Deterministic Dataset Generator
 *
 * Generates large datasets with seeded randomness for reproducible tests.
 */

export interface TestUser {
  id: string;
  name: string;
  email: string;
  age: number;
  salary: number;
  department: 'Engineering' | 'Sales' | 'Marketing' | 'HR' | 'Finance';
  role: 'admin' | 'user' | 'guest';
  active: boolean;
  joinedAt: string;
}

/**
 * Seeded pseudo-random number generator (LCG algorithm)
 * Ensures reproducible random sequences
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }
}

/**
 * Generate deterministic test dataset
 */
export function generateDataset(size: number, seed = 42): TestUser[] {
  const rng = new SeededRandom(seed);
  const departments: Array<TestUser['department']> = [
    'Engineering',
    'Sales',
    'Marketing',
    'HR',
    'Finance',
  ];
  const roles: Array<TestUser['role']> = ['admin', 'user', 'guest'];

  return Array.from({ length: size }, (_, i) => {
    const dept = rng.choice(departments);
    const role = rng.choice(roles);
    const age = rng.nextInt(22, 65);
    const salary = rng.nextInt(30000, 150000);
    const active = rng.next() > 0.1; // 90% active
    const yearOffset = rng.nextInt(0, 5);
    const monthOffset = rng.nextInt(0, 11);

    return {
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age,
      salary,
      department: dept,
      role,
      active,
      joinedAt: new Date(2019 + yearOffset, monthOffset, 1).toISOString(),
    };
  });
}

/**
 * Apply filters to dataset (server-side simulation)
 */
export function applyFilters(
  data: TestUser[],
  filters: Record<string, any>
): TestUser[] {
  let filtered = [...data];

  Object.entries(filters).forEach(([field, filterValue]) => {
    if (!filterValue) return;

    const { op, value } = filterValue as { op: string; value: any };

    switch (op) {
      case 'contains':
        filtered = filtered.filter((row) =>
          String(row[field as keyof TestUser])
            .toLowerCase()
            .includes(String(value).toLowerCase())
        );
        break;

      case 'equals':
        filtered = filtered.filter(
          (row) => row[field as keyof TestUser] === value
        );
        break;

      case 'range':
        filtered = filtered.filter((row) => {
          const val = row[field as keyof TestUser] as number;
          if (value.from !== undefined && val < value.from) return false;
          if (value.to !== undefined && val > value.to) return false;
          return true;
        });
        break;
    }
  });

  return filtered;
}

/**
 * Apply sorting to dataset (server-side simulation)
 */
export function applySorting(
  data: TestUser[],
  sorts: Array<{ field: string; direction: 'asc' | 'desc'; priority: number }>
): TestUser[] {
  if (!sorts || sorts.length === 0) return data;

  return [...data].sort((a, b) => {
    for (const sort of sorts) {
      const aVal = a[sort.field as keyof TestUser];
      const bVal = b[sort.field as keyof TestUser];

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}
