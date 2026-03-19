import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Users, 
  Clock, 
  Shield, 
  X,
  CheckCircle2,
  LogOut,
  Calendar
} from 'lucide-react';
import { collection, addDoc, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Visitor } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Visitors: React.FC = () => {
  const { profile } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager';
  const canEdit = isAdmin || isManager;

  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    entryTime: new Date().toISOString().slice(0, 16),
    protectiveGear: true
  });

  useEffect(() => {
    const q = query(collection(db, 'visitors'), orderBy('entryTime', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visitor));
      setVisitors(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'visitors');
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const visitorData = {
        ...formData,
        farmId: 'farm-alpha', // Mocking farm ID
        recordedBy: auth.currentUser.uid
      };

      await addDoc(collection(db, 'visitors'), visitorData);
      setIsModalOpen(false);
      setFormData({ 
        name: '', 
        purpose: '', 
        entryTime: new Date().toISOString().slice(0, 16), 
        protectiveGear: true 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'visitors');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const exitTime = new Date().toISOString().slice(0, 16);
      await updateDoc(doc(db, 'visitors', id), { exitTime });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `visitors/${id}`);
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Visitor Management</h1>
          <p className="text-slate-500 mt-1">Log and monitor farm entry/exit for biosecurity compliance</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="glass-button flex items-center gap-2 shadow-xl shadow-indigo-500/20"
          >
            <Plus size={20} />
            <span>Log Visitor</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search visitors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-12"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Visitor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Purpose</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Entry</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Exit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Compliance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVisitors.map((v) => (
                <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 font-bold border border-white/10">
                        {v.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{v.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {v.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300">{v.purpose}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={14} />
                      {new Date(v.entryTime).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={14} />
                      {v.exitTime ? new Date(v.exitTime).toLocaleString() : <span className="text-amber-500 font-bold">On Site</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 text-xs font-bold ${
                      v.protectiveGear ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      <Shield size={14} />
                      <span className="uppercase tracking-widest">{v.protectiveGear ? 'Gear Used' : 'No Gear'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!v.exitTime && canEdit && (
                      <button 
                        onClick={() => handleCheckOut(v.id)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 justify-end ml-auto"
                      >
                        <LogOut size={14} />
                        Check Out
                      </button>
                    )}
                    {!v.exitTime && !canEdit && (
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">On Site</span>
                    )}
                    {v.exitTime && <CheckCircle2 size={16} className="text-emerald-500 ml-auto" />}
                  </td>
                </tr>
              ))}
              {filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Users size={48} />
                      <p className="text-sm font-medium">No visitor logs found</p>
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
                <h3 className="text-2xl font-display font-bold text-white">Log Visitor Entry</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visitor Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Entry Time</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={formData.entryTime}
                    onChange={(e) => setFormData({...formData, entryTime: e.target.value})}
                    className="w-full glass-input" 
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <input 
                    type="checkbox" 
                    id="gear"
                    checked={formData.protectiveGear}
                    onChange={(e) => setFormData({...formData, protectiveGear: e.target.checked})}
                    className="w-5 h-5 accent-emerald-500 rounded border-white/10 bg-white/5"
                  />
                  <label htmlFor="gear" className="text-sm font-bold text-slate-300 cursor-pointer">
                    Visitor provided with protective gear
                  </label>
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
                    Save Log
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

export default Visitors;
