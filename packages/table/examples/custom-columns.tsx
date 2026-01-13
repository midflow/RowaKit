/**
 * Custom Columns Example - Using col.custom() for Complete Rendering Control
 * 
 * This example demonstrates:
 * - Using col.custom() for complete rendering control
 * - Combining multiple fields into a single column
 * - Custom styling and components
 * - Computed columns (calculated from other fields)
 * - Rich formatting (avatars, stars, currency)
 * 
 * When to use col.custom():
 * - Multiple fields in one column (name + email in same cell)
 * - Computed values (tenure calculated from hireDate)
 * - Complex rendering (stars, badges, custom HTML)
 * - When built-in col.text/col.number/col.date don't fit
 */

/* eslint-disable no-console */

import React from 'react';
import { RowaKitTable, col } from '@rowakit/table';
import type { Fetcher } from '@rowakit/table';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  salary: number;
  hireDate: Date;
  performance: number; // 1-5 scale
}

// Mock fetcher - in production this calls your backend API
const fetchEmployees: Fetcher<Employee> = async (_query) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const employees: Employee[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      salary: 95000,
      hireDate: new Date('2020-03-15'),
      performance: 4.5,
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      department: 'Marketing',
      salary: 78000,
      hireDate: new Date('2021-06-01'),
      performance: 4.8,
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@company.com',
      department: 'Sales',
      salary: 82000,
      hireDate: new Date('2019-11-20'),
      performance: 3.9,
    },
  ];

  return {
    items: employees,
    total: employees.length,
  };
};

export function EmployeesTableWithCustomColumns() {
  return (
    <div>
      <h1>Employee Directory</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        This example shows custom columns with rich formatting, avatars, and computed values.
      </p>
      
      <RowaKitTable
        fetcher={fetchEmployees}
        columns={[
          // CUSTOM COLUMN 1: Avatar + Full Name + Email
          // Use case: Display multiple related fields together
          col.custom<Employee>(
            'fullName',  // ID (must be unique per column)
            {
              header: 'Employee',  // Column header
              renderCell: (employee) => (  // Your rendering function
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Avatar with initials */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                    }}
                  >
                    {employee.firstName[0]}{employee.lastName[0]}
                  </div>
                  {/* Name and email */}
                  <div>
                    <div style={{ fontWeight: '600' }}>
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {employee.email}
                    </div>
                  </div>
                </div>
              ),
            }
          ),

          // Regular text column
          col.text<Employee>('department', {
            header: 'Department',
          }),

          // CUSTOM COLUMN 2: Formatted Salary
          // Use case: Currency formatting, alignment, styling
          col.custom<Employee>(
            'salary',  // Column ID
            {
              header: 'Annual Salary',
              renderCell: (employee) => (
                <div style={{ textAlign: 'right', fontWeight: '500' }}>
                  {/* Use Intl.NumberFormat for currency formatting */}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(employee.salary)}
                </div>
              ),
            }
          ),

          // CUSTOM COLUMN 3: Computed Tenure
          // Use case: Calculate derived values from data
          col.custom<Employee>(
            'tenure',  // Column ID
            {
              header: 'Tenure',
              renderCell: (employee) => {
                // Calculate years from hireDate to now
                const years = Math.floor(
                  (Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
                );
                return (
                  <span>
                    {years} {years === 1 ? 'year' : 'years'}
                  </span>
                );
              },
            }
          ),

          // CUSTOM COLUMN 4: Star Rating
          // Use case: Visual indicators, rich formatting
          col.custom<Employee>(
            'performance',  // Column ID
            {
              header: 'Performance',
              renderCell: (employee) => {
                const fullStars = Math.floor(employee.performance);
                const hasHalfStar = employee.performance % 1 >= 0.5;
                
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {/* Display star count */}
                    {'⭐'.repeat(fullStars)}
                    {hasHalfStar && '⭐'}
                    {/* Show numeric value */}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {employee.performance.toFixed(1)}
                    </span>
                  </div>
                );
              },
            }
          ),

          // Action column
          col.actions<Employee>([
            {
              id: 'view-profile',
              label: 'Profile',
              onClick: (employee) => {
                console.log('View profile:', employee);
                // Navigate to detail page
              },
            },
          ]),
        ]}
        rowKey="id"
      />
    </div>
  );
}
