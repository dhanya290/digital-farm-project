import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Farm, BiosecurityRecord, Alert } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import FarmDetailModal from '../components/FarmDetailModal';

const Dashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [recentRecords, setRecentRecords] = useState<BiosecurityRecord[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState<{
    name: string;
    type: 'pig' | 'poultry';
    livestock: string;
    health: string;
    color: string;
  } | null>(null);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Farms
        const farmsSnap = await getDocs(collection(db, 'farms'));
        const farmsList = farmsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Farm));
        setFarms(farmsList);

        // Fetch Recent Records
        const recordsSnap = await getDocs(query(collection(db, 'records'), limit(5)));
        setRecentRecords(recordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BiosecurityRecord)));

        // Fetch Active Alerts
        const alertsSnap = await getDocs(query(collection(db, 'alerts'), where('resolved', '==', false), limit(5)));
        setActiveAlerts(alertsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert)));

      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'dashboard_data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = [
    { name: 'Mon', compliance: 85 },
    { name: 'Tue', compliance: 92 },
    { name: 'Wed', compliance: 88 },
    { name: 'Thu', compliance: 95 },
    { name: 'Fri', compliance: 90 },
    { name: 'Sat', compliance: 98 },
    { name: 'Sun', compliance: 94 },
  ];

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500 border border-${color}-500/20`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
          <TrendingUp size={14} />
          <span>{trend}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-display font-bold text-white mt-1">{value}</h3>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Farm Overview</h1>
          <p className="text-slate-500 mt-1">Real-time biosecurity monitoring & analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            System Online
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Daily Visitors" value="12" trend="+15%" color="blue" />
        <StatCard icon={ShieldAlert} label="Alerts Resolved" value="98%" trend="+2%" color="emerald" />
        <StatCard icon={Activity} label="Health Index" value="94.2" trend="+0.5%" color="purple" />
        <StatCard icon={CheckCircle2} label="Compliance Rate" value="96.8%" trend="+1.2%" color="amber" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold text-white">Compliance Trend</h3>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-slate-400 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorComp)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              onClick={() => {
                setSelectedFarm({
                  name: 'Pig Farm Alpha',
                  type: 'pig',
                  livestock: '1,240',
                  health: '92%',
                  color: 'pink'
                });
                setIsFarmModalOpen(true);
              }}
              className="glass-card p-6 border-l-4 border-l-pink-500 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white group-hover:text-pink-400 transition-colors">Pig Farm Alpha</h4>
                <ArrowUpRight size={18} className="text-slate-500 group-hover:text-pink-400 transition-colors" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-display font-bold text-white">1,240</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Total Livestock</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-500 font-bold">92% Health</p>
                  <div className="w-24 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div className="w-[92%] h-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }} 
              onClick={() => {
                setSelectedFarm({
                  name: 'Poultry Farm Beta',
                  type: 'poultry',
                  livestock: '8,500',
                  health: '96%',
                  color: 'blue'
                });
                setIsFarmModalOpen(true);
              }}
              className="glass-card p-6 border-l-4 border-l-blue-500 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">Poultry Farm Beta</h4>
                <ArrowUpRight size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-display font-bold text-white">8,500</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Total Livestock</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-500 font-bold">96% Health</p>
                  <div className="w-24 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div className="w-[96%] h-full bg-blue-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Alerts & Logs Section */}
        <div className="space-y-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Active Alerts
              </h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full font-bold uppercase">
                {activeAlerts.length} New
              </span>
            </div>
            <div className="space-y-4">
              {activeAlerts.length > 0 ? activeAlerts.map(alert => (
                <div key={alert.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <p className="text-sm text-slate-200 font-medium">{alert.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(alert.date).toLocaleTimeString()}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <CheckCircle2 size={32} className="text-emerald-500/20 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">No active alerts. All clear!</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-white">Recent Activity</h3>
              <button 
                onClick={() => navigate('/biosecurity')}
                className="text-xs text-emerald-500 hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="space-y-6">
              {recentRecords.map((record, idx) => (
                <div key={record.id || idx} className="flex gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      record.status === 'pass' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {record.type[0].toUpperCase()}
                    </div>
                    {idx !== recentRecords.length - 1 && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-white/5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-bold capitalize">{record.type} Log</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Recorded by {record.recordedBy.slice(0, 8)} • {new Date(record.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentRecords.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-4">No recent activity found.</p>
              )}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:bg-white/5 transition-all">
              View All Logs
            </button>
          </div>
        </div>
      </div>

      <FarmDetailModal
        isOpen={isFarmModalOpen}
        onClose={() => setIsFarmModalOpen(false)}
        farm={selectedFarm}
        records={recentRecords}
        alerts={activeAlerts}
      />
    </div>
  );
};

export default Dashboard;
