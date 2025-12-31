/**
 * Custom Columns Example - Using col.custom() for Complex Rendering
 * 
 * This example demonstrates:
 * - Using col.custom() for complete rendering control
 * - Combining multiple fields in a single column
 * - Adding custom styling and components
 * - Creating computed columns
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

// Mock fetcher
const fetchEmployees: Fetcher<Employee> = async (_query) => {
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
      
      <RowaKitTable
        fetcher={fetchEmployees}
        columns={[
          // Custom column: Full name with avatar
          col.custom<Employee>(
            'fullName',
            {
              header: 'Employee',
              renderCell: (employee) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

          col.text<Employee>('department', {
            header: 'Department',
          }),

          // Custom column: Formatted salary with currency
          col.custom<Employee>(
            'salary',
            {
              header: 'Annual Salary',
              renderCell: (employee) => (
                <div style={{ textAlign: 'right', fontWeight: '500' }}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(employee.salary)}
                </div>
              ),
            }
          ),

          // Custom column: Tenure calculation
          col.custom<Employee>(
            'tenure',
            {
              header: 'Tenure',
              renderCell: (employee) => {
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

          // Custom column: Performance rating with stars
          col.custom<Employee>(
            'performance',
            {
              header: 'Performance',
              renderCell: (employee) => {
                const fullStars = Math.floor(employee.performance);
                const hasHalfStar = employee.performance % 1 >= 0.5;
                
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {'⭐'.repeat(fullStars)}
                    {hasHalfStar && '⭐'}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {employee.performance.toFixed(1)}
                    </span>
                  </div>
                );
              },
            }
          ),

          col.actions<Employee>([
            {
              id: 'view-profile',
              label: 'Profile',
              onClick: (employee) => {
                console.log('View profile:', employee);
              },
            },
          ]),
        ]}
        rowKey="id"
      />
    </div>
  );
}
