import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts';
import { Database, TrendingDown, Users, DollarSign, Clock, Code2, ChevronDown } from 'lucide-react';

const API = import.meta.env.DEV
  ? 'http://localhost:8000/api/attrition'
  : '/api/attrition';
const COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#fb7185', '#fbbf24', '#34d399', '#f97316', '#e879f9'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
        <p style={{ color: '#94a3b8', marginBottom: '0.25rem', fontSize: '0.85rem' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState({});
  const [activeSql, setActiveSql] = useState({ title: '', sql: '' });
  const [sqlOpen, setSqlOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const endpoints = ['department', 'salary', 'promotion', 'distance', 'age', 'overtime', 'satisfaction', 'jobrole'];
    Promise.all(endpoints.map(e => axios.get(`${API}/${e}`).then(r => ({ [e]: r.data }))))
      .then(results => {
        const merged = Object.assign({}, ...results);
        setData(merged);
        setActiveSql({ title: 'Department Attrition – CTEs', sql: merged.department?.sql || '' });
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const showSql = (title, key) => {
    setActiveSql({ title, sql: data[key]?.sql || '' });
    setSqlOpen(true);
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{title}</p>
        <p style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</p>
      </div>
      <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: `${color}22`, color }}>
        <Icon size={26} />
      </div>
    </div>
  );

  const ChartCard = ({ title, children, sqlKey, sqlTitle, badge }) => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {badge && <span className={`badge badge-${badge === 'CTE' ? 'blue' : 'purple'}`}>{badge}</span>}
          {sqlKey && (
            <button onClick={() => showSql(sqlTitle, sqlKey)}
              style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: 'none', borderRadius: '9999px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Code2 size={12} /> SQL
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard data…</p>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: '#fb7185', fontSize: '1.2rem' }}>⚠️ API Error: {error}</p>
      <p style={{ color: 'var(--text-secondary)' }}>Make sure the backend is running: <code>uvicorn main:app --reload</code></p>
    </div>
  );

  const deptData = data.department?.data || [];
  const salaryData = (data.salary?.data || []).slice(0, 20);
  const distData = data.distance?.data || [];
  const ageData = data.age?.data || [];
  const overtimeData = data.overtime?.data || [];
  const satData = data.satisfaction?.data || [];
  const roleData = data.jobrole?.data || [];
  const promoData = data.promotion?.data || [];

  // Promotion risk summary
  const promoSummary = promoData.reduce((acc, r) => {
    acc[r.PromotionRisk] = (acc[r.PromotionRisk] || 0) + 1;
    return acc;
  }, {});
  const promoChartData = Object.entries(promoSummary).map(([k, v]) => ({ name: k, count: v }));

  // Radar data from satisfaction
  const satMap = { 1: 'Very Low', 2: 'Low', 3: 'High', 4: 'Very High' };
  const satChartData = satData.map(r => ({ ...r, label: satMap[r.JobSatisfaction] || r.JobSatisfaction }));

  return (
    <div className="dashboard-container">
      {/* ── Header ── */}
      <header>
        <div>
          <h1>HR Attrition Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Advanced analytics powered by <strong style={{ color: '#38bdf8' }}>DuckDB</strong> · CTEs · Window Functions
          </p>
        </div>
        <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <Database size={14} /> DuckDB Powered
        </span>
      </header>

      {/* ── KPI Cards ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard title="Total Employees" value="1,470" icon={Users} color="#38bdf8" />
        <StatCard title="Overall Attrition" value={`${deptData.length ? parseFloat(deptData[0]?.CompanyAvgRate || 16.1).toFixed(1) : '16.1'}%`} icon={TrendingDown} color="#fb7185" />
        <StatCard title="Avg Monthly Income" value="$6,503" icon={DollarSign} color="#34d399" />
        <StatCard title="Avg Tenure" value="7.0 Yrs" icon={Clock} color="#818cf8" />
      </div>

      {/* ── Row 1: Dept Attrition + Age Attrition ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>
        <ChartCard title="Attrition Rate by Department vs. Company Avg" sqlKey="department" sqlTitle="Department Attrition – CTEs" badge="CTE">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="Department" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" unit="%" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="DeptAttritionRate" name="Dept %" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="CompanyAvgRate" name="Co Avg %" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Attrition Rate by Age Group" sqlKey="age" sqlTitle="Age Group Attrition – CTEs" badge="CTE">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="AgeGroup" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" unit="%" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey="AttritionRate" name="Attrition %" fill="#fb7185" radius={[4, 4, 0, 0]}>
                  {ageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 2: Overtime Donut + Distance Bar ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
        <ChartCard title="Overtime vs. Attrition" sqlKey="overtime" sqlTitle="Overtime Attrition – CTE" badge="CTE">
          <div style={{ display: 'flex', gap: '1rem', height: '260px', alignItems: 'center' }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={overtimeData} dataKey="Attrited" nameKey="OverTime" cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90} paddingAngle={4} label={({ OverTime, AttritionRate }) => `${OverTime}: ${AttritionRate}%`}
                  labelLine={false}>
                  {overtimeData.map((_, i) => <Cell key={i} fill={i === 0 ? '#fb7185' : '#34d399'} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {overtimeData.map((d, i) => (
                <div key={i} style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', borderLeft: `3px solid ${i === 0 ? '#fb7185' : '#34d399'}` }}>
                  <p style={{ fontWeight: 700, color: i === 0 ? '#fb7185' : '#34d399' }}>OT: {d.OverTime}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{d.AttritionRate}% attrition</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{d.Total} employees</p>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Attrition by Distance from Home" sqlKey="distance" sqlTitle="Distance Attrition – CTE" badge="CTE">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#64748b" unit="%" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="DistanceCategory" stroke="#64748b" tick={{ fontSize: 11 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="AttritionRate" name="Attrition %" fill="#fbbf24" radius={[0, 4, 4, 0]}>
                  {distData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: Salary Area + Job Satisfaction Line ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>
        <ChartCard title="Salary Distribution by Percentile (Sample)" sqlKey="salary" sqlTitle="Salary Benchmarking – Window Functions" badge="Window Fn">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salaryData}>
                <defs>
                  <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="SalaryPercentile" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Percentile', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="MonthlyIncome" name="Monthly Income" stroke="#38bdf8" fill="url(#salaryGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="DeptAvgSalary" name="Dept Avg" stroke="#818cf8" fill="none" strokeDasharray="5 5" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Job Satisfaction vs. Attrition Rate" sqlKey="satisfaction" sqlTitle="Job Satisfaction Attrition" badge="Aggregation">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={satChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" unit="%" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Line type="monotone" dataKey="AttritionRate" name="Attrition %" stroke="#fb7185" strokeWidth={3} dot={{ fill: '#fb7185', strokeWidth: 2, r: 5 }} />
                <Line type="monotone" dataKey="Total" name="Total Employees" stroke="#818cf8" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#818cf8', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 4: Job Role + Promotion Risk ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>
        <ChartCard title="Attrition Rate by Job Role (Risk Ranked)" sqlKey="jobrole" sqlTitle="Job Role Attrition – Window RANK()" badge="Window Fn">
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#64748b" unit="%" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="JobRole" stroke="#64748b" tick={{ fontSize: 10 }} width={160} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="AttritionRate" name="Attrition %" radius={[0, 4, 4, 0]}>
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Promotion Risk Distribution" sqlKey="promotion" sqlTitle="Promotion Risk – Window AVG()" badge="Window Fn">
          <div style={{ height: 320, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={promoChartData} dataKey="count" nameKey="name" cx="50%" cy="50%"
                  outerRadius={110} paddingAngle={3}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={{ stroke: '#64748b', strokeWidth: 1 }}>
                  {promoChartData.map((d, i) => (
                    <Cell key={i} fill={d.name === 'High Risk' ? '#fb7185' : d.name === 'Above Average' ? '#fbbf24' : '#34d399'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── SQL Explorer ── */}
      <div className="sql-explorer">
        <div className="sql-header" onClick={() => setSqlOpen(o => !o)} style={{ cursor: 'pointer' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Code2 color="#38bdf8" size={20} />
            <span className="badge badge-blue">SQL</span>
            {activeSql.title}
          </h2>
          <ChevronDown
            size={20}
            color="#94a3b8"
            style={{ transform: sqlOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
          />
        </div>
        {sqlOpen && (
          <>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              Click any <strong style={{ color: '#818cf8' }}>SQL</strong> button on a chart to inspect its query.
            </p>
            <pre><code>{activeSql.sql}</code></pre>
          </>
        )}
      </div>
    </div>
  );
}
