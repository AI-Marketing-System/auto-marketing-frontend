import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/AnalyticsDashboardV2.css';

const dataViews = [
  { date: '31/05 01/06', views: 0 },
  { date: '03/06', views: 0 },
  { date: '05/06', views: 0 },
  { date: '07/06', views: 0 },
  { date: '09/06', views: 0 },
  { date: '11/06', views: 0 },
  { date: '13/06', views: 0 },
  { date: '15/06', views: 0 },
  { date: '17/06', views: 0 },
  { date: '19/06', views: 0 },
  { date: '21/06', views: 0 },
  { date: '23/06', views: 0 },
  { date: '25/06', views: 0 },
  { date: '26/06', views: 130 },
  { date: '27/06', views: 5 },
  { date: '28/06', views: 0 },
  { date: '29/06', views: 15 },
];

const dataReach = [
  { date: '31/05 01/06', value: 0 },
  { date: '03/06', value: 0 },
  { date: '05/06', value: 0 },
  { date: '07/06', value: 0 },
  { date: '09/06', value: 0 },
  { date: '11/06', value: 0 },
  { date: '13/06', value: 0 },
  { date: '15/06', value: 0 },
  { date: '17/06', value: 0 },
  { date: '19/06', value: 0 },
  { date: '21/06', value: 0 },
  { date: '23/06', value: 0 },
  { date: '25/06', value: 0 },
  { date: '26/06', value: 100 },
  { date: '27/06', value: 2 },
  { date: '28/06', value: 0 },
  { date: '29/06', value: 3 },
];

export const ViewsAreaChart = () => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Lượt xem nội dung</h3>
        <p className="chart-subtitle">Tổng số lần nội dung của bạn xuất hiện trên màn hình.</p>
      </div>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart
            data={dataViews}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9254de" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#9254de" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#eee" />
            <XAxis dataKey="date" tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} label={{ value: 'Lượt xem nội dung', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fontWeight: 600 } }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="views" stroke="#9254de" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const ReachAreaChart = () => {
  const [activeTab, setActiveTab] = useState('Reach');

  return (
    <div className="chart-card">
      <div className="chart-tabs">
        <div 
          className={`chart-tab ${activeTab === 'Reach' ? 'active' : ''}`}
          onClick={() => setActiveTab('Reach')}
        >
          Reach
        </div>
        <div 
          className={`chart-tab ${activeTab === 'Reaction' ? 'active' : ''}`}
          onClick={() => setActiveTab('Reaction')}
        >
          Reaction
        </div>
      </div>

      <div className="chart-header">
        <h3 className="chart-title">Lượt tiếp cận</h3>
        <p className="chart-subtitle">Số lượng người duy nhất đã xem nội dung của bạn.</p>
      </div>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart
            data={dataReach}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9254de" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#9254de" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#eee" />
            <XAxis dataKey="date" tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} label={{ value: 'Lượt tiếp cận', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fontWeight: 600 } }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="value" stroke="#9254de" fillOpacity={1} fill="url(#colorReach)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
