"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const testData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 278 },
];

const pieData = [
  { name: 'Food', value: 400, fill: '#8884d8' },
  { name: 'Transport', value: 300, fill: '#82ca9d' },
  { name: 'Entertainment', value: 200, fill: '#ffc658' },
];

export function ChartTest() {
  console.log('ChartTest component rendered');
  
  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-bold">Chart Test Component</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Bar Chart Test</h3>
        <div className="h-[300px] border border-gray-300 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={testData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pie Chart Test</h3>
        <div className="h-[300px] border border-gray-300 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
