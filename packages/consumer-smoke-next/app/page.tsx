/**
 * Page Component — Next.js App Router
 *
 * This page demonstrates RowaKit Table in a Next.js App Router environment.
 * It validates:
 * - SSR compatibility (no hydration mismatches)
 * - Client-side interactivity (sorting, pagination)
 * - Proper server/client component boundaries
 * - No Next.js specific issues
 */

import { UsersTable } from './table';

export default function Page() {
  return (
    <div className="container">
      <div className="header">
        <h1>RowaKit × Next.js — Smoke Test</h1>
        <p>
          Validates RowaKit Table compatibility with Next.js App Router, SSR, and hydration.
        </p>
      </div>

      <div className="content">
        <UsersTable />
      </div>
    </div>
  );
}
