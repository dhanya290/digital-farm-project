import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Users,
  Package
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BiosecurityRecord, Visitor, InventoryItem, Animal } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports: React.FC = () => {
  const [records, setRecords] = useState<BiosecurityRecord[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      const unsubRecords = onSnapshot(collection(db, 'records'), (s) => setRecords(s.docs.map(d => d.data() as BiosecurityRecord)), (e) => handleFirestoreError(e, OperationType.LIST, 'records'));
      const unsubVisitors = onSnapshot(collection(db, 'visitors'), (s) => setVisitors(s.docs.map(d => d.data() as Visitor)), (e) => handleFirestoreError(e, OperationType.LIST, 'visitors'));
      const unsubInventory = onSnapshot(collection(db, 'inventory'), (s) => setInventory(s.docs.map(d => d.data() as InventoryItem)), (e) => handleFirestoreError(e, OperationType.LIST, 'inventory'));
      const unsubAnimals = onSnapshot(collection(db, 'animals'), (s) => setAnimals(s.docs.map(d => d.data() as Animal)), (e) => handleFirestoreError(e, OperationType.LIST, 'animals'));
      
      setLoading(false);
      return () => {
        unsubRecords();
        unsubVisitors();
        unsubInventory();
        unsubAnimals();
      };
    };
    fetchData();
  }, []);

  const biosecurityStats = [
    { name: 'Pass', value: records.filter(r => r.status === 'pass').length },
    { name: 'Fail', value: records.filter(r => r.status === 'fail').length },
    { name: 'Pending', value: records.filter(r => r.status === 'pending').length },
  ];

  const inventoryStats = inventory.map(item => ({
    name: item.name,
    quantity: item.quantity,
    threshold: item.minThreshold
  }));

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Analytics & Reports</h1>
          <p className="text-slate-500 mt-1">Generate and export farm performance data</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => exportToCSV(records, 'biosecurity_report')}
            className="glass-button flex items-center gap-2"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Biosecurity Compliance Chart */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={20} />
              Biosecurity Compliance
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={biosecurityStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {biosecurityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {biosecurityStats.map((stat, i) => (
              <div key={stat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-xs text-slate-400">{stat.name}: {stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Levels Chart */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Package className="text-blue-500" size={20} />
              Inventory Stock Levels
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="threshold" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Visitors</p>
              <p className="text-2xl font-display font-bold text-white">{visitors.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Logs</p>
              <p className="text-2xl font-display font-bold text-white">{records.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Low Stock Items</p>
              <p className="text-2xl font-display font-bold text-white">
                {inventory.filter(i => i.quantity <= i.minThreshold).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
