import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Syringe, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  X,
  User,
  PawPrint,
  Bird
} from 'lucide-react';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Vaccination, Animal } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Vaccinations: React.FC = () => {
  const { profile } = useAuth();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager';
  const canEdit = isAdmin || isManager;

  const [formData, setFormData] = useState({
    animalId: '',
    vaccineName: '',
    dateAdministered: new Date().toISOString().split('T')[0],
    nextDueDate: ''
  });

  useEffect(() => {
    // Fetch Vaccinations
    const vQuery = query(collection(db, 'vaccinations'), orderBy('dateAdministered', 'desc'));
    const unsubscribeV = onSnapshot(vQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vaccination));
      setVaccinations(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vaccinations');
    });

    // Fetch Animals for the dropdown
    const aQuery = query(collection(db, 'animals'));
    const unsubscribeA = onSnapshot(aQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal));
      setAnimals(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'animals');
    });

    return () => {
      unsubscribeV();
      unsubscribeA();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const vaxData = {
        ...formData,
        recordedBy: auth.currentUser.uid
      };

      await addDoc(collection(db, 'vaccinations'), vaxData);
      setIsModalOpen(false);
      setFormData({ 
        animalId: '', 
        vaccineName: '', 
        dateAdministered: new Date().toISOString().split('T')[0], 
        nextDueDate: '' 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'vaccinations');
    }
  };

  const getAnimalInfo = (id: string) => {
    return animals.find(a => a.id === id);
  };

  const filteredVaccinations = vaccinations.filter(v => {
    const animal = getAnimalInfo(v.animalId);
    return v.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           animal?.breed.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Vaccination Records</h1>
          <p className="text-slate-500 mt-1">Schedule and monitor livestock immunization programs</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="glass-button flex items-center gap-2 shadow-xl shadow-blue-500/20"
          >
            <Plus size={20} />
            <span>Record Vaccination</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by vaccine or animal breed..." 
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Animal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Vaccine</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date Administered</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Next Due</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVaccinations.map((v) => {
                const animal = getAnimalInfo(v.animalId);
                const isOverdue = new Date(v.nextDueDate) < new Date();
                return (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          animal?.type === 'Pig' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {animal?.type === 'Pig' ? <PawPrint size={16} /> : <Bird size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{animal?.breed || 'Unknown'}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {v.animalId.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Syringe size={14} className="text-blue-400" />
                        <span className="text-sm text-slate-300">{v.vaccineName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar size={14} />
                        {new Date(v.dateAdministered).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 text-sm font-bold ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                        <Calendar size={14} />
                        {new Date(v.nextDueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 text-xs font-bold ${
                        isOverdue ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                        {isOverdue ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                        <span className="uppercase tracking-widest">{isOverdue ? 'Overdue' : 'Scheduled'}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredVaccinations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Syringe size={48} />
                      <p className="text-sm font-medium">No vaccination records found</p>
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
                <h3 className="text-2xl font-display font-bold text-white">Record Vaccination</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Animal</label>
                  <select 
                    required
                    value={formData.animalId}
                    onChange={(e) => setFormData({...formData, animalId: e.target.value})}
                    className="w-full glass-input appearance-none"
                  >
                    <option value="">Choose an animal...</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.breed} ({a.type}) - #{a.id.slice(0, 6)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vaccine Name</label>
                  <input 
                    required
                    type="text" 
                    list="vaccine-suggestions"
                    value={formData.vaccineName}
                    onChange={(e) => setFormData({...formData, vaccineName: e.target.value})}
                    className="w-full glass-input" 
                    placeholder="e.g. Swine Flu, Newcastle Disease"
                  />
                  <datalist id="vaccine-suggestions">
                    <option value="Parvovirus" />
                    <option value="Erysipelas" />
                    <option value="Leptospirosis" />
                    <option value="Mycoplasma" />
                    <option value="Marek's Disease" />
                    <option value="Newcastle Disease" />
                    <option value="Infectious Bronchitis" />
                    <option value="Gumboro Disease" />
                    <option value="Fowl Pox" />
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date Administered</label>
                    <input 
                      required
                      type="date" 
                      value={formData.dateAdministered}
                      onChange={(e) => setFormData({...formData, dateAdministered: e.target.value})}
                      className="w-full glass-input" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Next Due Date</label>
                    <input 
                      required
                      type="date" 
                      value={formData.nextDueDate}
                      onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})}
                      className="w-full glass-input" 
                    />
                  </div>
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
                    Save Record
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

export default Vaccinations;
