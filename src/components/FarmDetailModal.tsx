import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Activity, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Farm, BiosecurityRecord, Alert } from '../types';

interface FarmDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: {
    name: string;
    type: 'pig' | 'poultry';
    livestock: string;
    health: string;
    color: string;
  } | null;
  records: BiosecurityRecord[];
  alerts: Alert[];
}

const FarmDetailModal: React.FC<FarmDetailModalProps> = ({ isOpen, onClose, farm, records, alerts }) => {
  const navigate = useNavigate();
  if (!farm) return null;

  const farmRecords = records.filter(r => r.farmId === (farm.name.toLowerCase().includes('alpha') ? 'farm-alpha' : 'farm-beta'));
  const farmAlerts = alerts.filter(a => a.farmId === (farm.name.toLowerCase().includes('alpha') ? 'farm-alpha' : 'farm-beta'));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col"
          >
            {/* Header */}
            <div className={`h-48 bg-gradient-to-br ${
              farm.type === 'pig' ? 'from-pink-600 to-rose-700' : 'from-blue-600 to-indigo-700'
            } relative p-8 flex flex-col justify-end`}>
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-xl text-white transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white">
                      {farm.type} Facility
                    </span>
                    <span className="flex items-center gap-1 text-white/80 text-xs">
                      <MapPin size={12} />
                      Sector 7G, North Zone
                    </span>
                  </div>
                  <h2 className="text-4xl font-display font-bold text-white">{farm.name}</h2>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Current Status</p>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Operational
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-950/50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                          <Users size={18} />
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase">Livestock</span>
                      </div>
                      <p className="text-2xl font-display font-bold text-white">{farm.livestock}</p>
                      <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
                        <TrendingUp size={10} /> +2.4% this month
                      </p>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Activity size={18} />
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase">Health Score</span>
                      </div>
                      <p className="text-2xl font-display font-bold text-white">{farm.health}</p>
                      <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: farm.health }} />
                      </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                          <ShieldCheck size={18} />
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase">Compliance</span>
                      </div>
                      <p className="text-2xl font-display font-bold text-white">98.2%</p>
                      <p className="text-[10px] text-slate-500 mt-1">Last audit: 2 days ago</p>
                    </div>
                  </div>

                  {/* Recent Records */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-white">Recent Biosecurity Logs</h3>
                      <button 
                        onClick={() => {
                          onClose();
                          navigate('/biosecurity');
                        }}
                        className="text-xs text-emerald-500 hover:underline flex items-center gap-1"
                      >
                        View All <ArrowRight size={12} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {farmRecords.length > 0 ? farmRecords.map(record => (
                        <div key={record.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              record.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                              <ShieldCheck size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white capitalize">{record.type.replace('_', ' ')}</p>
                              <p className="text-[10px] text-slate-500">{new Date(record.date).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                            record.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                      )) : (
                        <p className="text-sm text-slate-600 italic py-4">No recent logs for this facility.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Alerts & Info */}
                <div className="space-y-8">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <h3 className="font-display font-bold text-white flex items-center gap-2 mb-4">
                      <AlertTriangle size={18} className="text-amber-500" />
                      Active Alerts
                    </h3>
                    <div className="space-y-4">
                      {farmAlerts.length > 0 ? farmAlerts.map(alert => (
                        <div key={alert.id} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <p className="text-xs text-amber-200 leading-relaxed">{alert.message}</p>
                          <p className="text-[10px] text-amber-500/60 mt-2">{new Date(alert.date).toLocaleTimeString()}</p>
                        </div>
                      )) : (
                        <div className="text-center py-6">
                          <ShieldCheck size={24} className="text-emerald-500/20 mx-auto mb-2" />
                          <p className="text-[10px] text-slate-600">No active alerts for this facility.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <h3 className="font-display font-bold text-white mb-4">Facility Info</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Manager</span>
                        <span className="text-slate-200">Dr. Sarah Chen</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Established</span>
                        <span className="text-slate-200">Jan 2024</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Last Inspection</span>
                        <span className="text-slate-200">Mar 10, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FarmDetailModal;
