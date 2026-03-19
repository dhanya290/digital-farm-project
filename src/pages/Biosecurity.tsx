import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Truck, 
  Droplets, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle,
  Calendar,
  ShieldCheck,
  X
} from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { BiosecurityRecord, RecordType, RecordStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Biosecurity: React.FC = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<BiosecurityRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<RecordType>('visitor');
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager';
  const canEdit = isAdmin || isManager;

  // Form State
  const [formData, setFormData] = useState({
    visitorName: '',
    purpose: '',
    vehicleNumber: '',
    sanitationZone: '',
    notes: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'records'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BiosecurityRecord));
      setRecords(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'records');
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const newRecord = {
        farmId: 'farm-alpha', // Mocking farm ID for now
        date: new Date().toISOString(),
        type: activeTab,
        status: 'pass' as RecordStatus,
        recordedBy: auth.currentUser.uid,
        details: { ...formData }
      };

      await addDoc(collection(db, 'records'), newRecord);
      setIsModalOpen(false);
      setFormData({ visitorName: '', purpose: '', vehicleNumber: '', sanitationZone: '', notes: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'records');
    }
  };

  const tabs = [
    { id: 'visitor', icon: Users, label: 'Visitors' },
    { id: 'vehicle', icon: Truck, label: 'Vehicles' },
    { id: 'sanitation', icon: Droplets, label: 'Sanitation' },
    { id: 'disease_check', icon: ShieldCheck, label: 'Disease Check' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Biosecurity Logs</h1>
          <p className="text-slate-500 mt-1">Manage and track all farm entry and sanitation activities</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="glass-button flex items-center gap-2 shadow-xl shadow-emerald-500/20"
          >
            <Plus size={20} />
            <span>New Entry</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search records..." 
            className="w-full glass-input pl-12"
          />
        </div>
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as RecordType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.filter(r => r.type === activeTab).map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-slate-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(record.date).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400 capitalize">{record.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300 max-w-xs truncate">
                      {record.type === 'visitor' && `Visitor: ${record.details.visitorName}`}
                      {record.type === 'vehicle' && `Vehicle: ${record.details.vehicleNumber}`}
                      {record.type === 'sanitation' && `Zone: ${record.details.sanitationZone}`}
                      {record.type === 'disease_check' && record.details.notes}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 text-xs font-bold ${
                      record.status === 'pass' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {record.status === 'pass' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      <span className="uppercase tracking-widest">{record.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-mono">ID: {record.recordedBy.slice(0, 8)}</span>
                  </td>
                </tr>
              ))}
              {records.filter(r => r.type === activeTab).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <ShieldCheck size={48} />
                      <p className="text-sm font-medium">No records found for this category</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-lg p-8 relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-bold text-white capitalize">New {activeTab} Entry</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'visitor' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visitor Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.visitorName}
                        onChange={(e) => setFormData({...formData, visitorName: e.target.value})}
                        className="w-full glass-input" 
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Purpose of Visit</label>
                      <input 
                        required
                        type="text" 
                        value={formData.purpose}
                        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                        className="w-full glass-input" 
                        placeholder="e.g. Maintenance, Inspection"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'vehicle' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicle Plate Number</label>
                    <input 
                      required
                      type="text" 
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                      className="w-full glass-input" 
                      placeholder="ABC-1234"
                    />
                  </div>
                )}

                {activeTab === 'sanitation' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sanitation Zone</label>
                    <select 
                      required
                      value={formData.sanitationZone}
                      onChange={(e) => setFormData({...formData, sanitationZone: e.target.value})}
                      className="w-full glass-input appearance-none"
                    >
                      <option value="">Select Zone</option>
                      <option value="Zone A - Entry">Zone A - Entry</option>
                      <option value="Zone B - Production">Zone B - Production</option>
                      <option value="Zone C - Storage">Zone C - Storage</option>
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Observations / Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full glass-input min-h-[100px] resize-none" 
                    placeholder="Any specific observations..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 glass-button"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Biosecurity;
