import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/AnalyticsDashboardV2.css';

const data = [
  { date: '31/05 01/06', followers: 2.0 },
  { date: '03/06', followers: 2.0 },
  { date: '05/06', followers: 2.0 },
  { date: '07/06', followers: 2.0 },
  { date: '09/06', followers: 2.0 },
  { date: '11/06', followers: 2.0 },
  { date: '13/06', followers: 3.0 },
  { date: '15/06', followers: 3.0 },
  { date: '17/06', followers: 3.0 },
  { date: '19/06', followers: 3.0 },
  { date: '21/06', followers: 3.0 },
  { date: '23/06', followers: 3.0 },
  { date: '25/06', followers: 3.0 },
  { date: '27/06', followers: 3.0 },
  { date: '29/06', followers: 3.0 },
];

const LineChartComponent = () => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Lượng người theo dõi</h3>
        <p className="chart-subtitle">Tổng số người theo dõi trang của bạn.</p>
      </div>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#eee" />
            <XAxis 
              dataKey="date" 
              tick={{fontSize: 10, fill: '#888'}} 
              axisLine={false} 
              tickLine={false} 
              dy={10} 
            />
            <YAxis 
              domain={[2.0, 3.0]} 
              tickCount={3} 
              tick={{fontSize: 10, fill: '#888'}} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(val) => val.toFixed(1)}
              label={{ value: 'Lượng người theo dõi', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fontWeight: 600 } }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="followers" 
              stroke="#9254de" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;
