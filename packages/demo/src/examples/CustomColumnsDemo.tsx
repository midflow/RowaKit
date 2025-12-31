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
  performance: number;
}

const MOCK_EMPLOYEES: Employee[] = [
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
    performance: 4.2,
  },
];

const fetchEmployees: Fetcher<Employee> = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    items: MOCK_EMPLOYEES,
    total: MOCK_EMPLOYEES.length,
  };
};

export default function CustomColumnsDemo() {
  return (
    <>
      <h2>Custom Columns Example</h2>
      <p>Advanced rendering with col.custom() - avatars, formatted values, and computed columns</p>
      
      <RowaKitTable
        fetcher={fetchEmployees}
        columns={[
          col.custom<Employee>({
            id: 'fullName',
            header: 'Employee',
            render: (employee) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    background: '#3b82f6',
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
                  <div style={{ fontWeight: 600 }}>
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {employee.email}
                  </div>
                </div>
              </div>
            ),
          }),
          col.text<Employee>('department'),
          col.custom<Employee>({
            id: 'salary',
            header: 'Salary',
            render: (employee) => (
              <div style={{ textAlign: 'right' }}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(employee.salary)}
              </div>
            ),
          }),
          col.custom<Employee>({
            id: 'tenure',
            header: 'Tenure',
            render: (employee) => {
              const years = Math.floor(
                (Date.now() - employee.hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
              );
              return <span>{years} {years === 1 ? 'year' : 'years'}</span>;
            },
          }),
          col.custom<Employee>({
            id: 'performance',
            header: 'Performance',
            render: (employee) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      color: star <= employee.performance ? '#f59e0b' : '#d1d5db',
                      fontSize: '1.125rem',
                    }}
                  >
                    ★
                  </span>
                ))}
                <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                  {employee.performance.toFixed(1)}
                </span>
              </div>
            ),
          }),
        ]}
        rowKey="id"
      />
    </>
  );
}
