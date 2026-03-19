import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Filter, 
  PawPrint, 
  Bird,
  X,
  ChevronRight,
  Activity,
  Calendar
} from 'lucide-react';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Animal } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Animals: React.FC = () => {
  const { profile } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager';
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin;

  const [formData, setFormData] = useState({
    type: 'Pig' as 'Pig' | 'Poultry',
    breed: '',
    age: 0,
    healthStatus: 'Healthy' as 'Healthy' | 'Sick' | 'Quarantined',
    imageUrl: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'animals'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal));
      setAnimals(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'animals');
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const animalData = {
        ...formData,
        farmId: 'farm-alpha', // Mocking farm ID
        age: Number(formData.age)
      };

      if (editingId) {
        await updateDoc(doc(db, 'animals', editingId), animalData);
      } else {
        await addDoc(collection(db, 'animals'), animalData);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ type: 'Pig', breed: '', age: 0, healthStatus: 'Healthy', imageUrl: '' });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, `animals/${editingId || ''}`);
    }
  };

  const handleEdit = (animal: Animal) => {
    setEditingId(animal.id);
    setFormData({
      type: animal.type,
      breed: animal.breed,
      age: animal.age,
      healthStatus: animal.healthStatus,
      imageUrl: animal.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'animals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `animals/${id}`);
    }
  };

  const filteredAnimals = animals.filter(a => 
    a.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Animal Management</h1>
          <p className="text-slate-500 mt-1">Track and manage livestock health and records</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ type: 'Pig', breed: '', age: 0, healthStatus: 'Healthy', imageUrl: '' });
              setIsModalOpen(true);
            }}
            className="glass-button flex items-center gap-2 shadow-xl shadow-emerald-500/20"
          >
            <Plus size={20} />
            <span>Add Animal</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by breed or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-12"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAnimals.map((animal) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={animal.id}
              className="glass-card p-6 group hover:border-emerald-500/30 transition-all"
            >
              <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl">
                <img 
                  src={animal.imageUrl || (animal.type === 'Pig' 
                    ? `https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800`
                    : `https://images.unsplash.com/photo-1516211697149-d8677ecd4e72?auto=format&fit=crop&q=80&w=800`
                  )} 
                  alt={animal.breed}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`p-2 rounded-xl backdrop-blur-md border border-white/10 ${
                    animal.type === 'Pig' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {animal.type === 'Pig' ? <PawPrint size={20} /> : <Bird size={20} />}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">{animal.breed}</h3>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">{animal.type}</p>
                </div>
                {(canEdit || canDelete) && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && (
                      <button 
                        onClick={() => handleEdit(animal)}
                        className="p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-emerald-500 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(animal.id)}
                        className="p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Age</p>
                    <p className="text-sm font-bold text-white">{animal.age} Months</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${
                      animal.healthStatus === 'Healthy' ? 'text-emerald-400' : 
                      animal.healthStatus === 'Sick' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      <Activity size={12} />
                      {animal.healthStatus}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={14} />
                    <span>Last Vax: {animal.lastVaccinationDate || 'None'}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-700" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
                <h3 className="text-2xl font-display font-bold text-white">{editingId ? 'Edit Animal' : 'Add New Animal'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'Pig' | 'Poultry'})}
                      className="w-full glass-input appearance-none"
                    >
                      <option value="Pig">Pig</option>
                      <option value="Poultry">Poultry</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Health Status</label>
                    <select 
                      value={formData.healthStatus}
                      onChange={(e) => setFormData({...formData, healthStatus: e.target.value as any})}
                      className="w-full glass-input appearance-none"
                    >
                      <option value="Healthy">Healthy</option>
                      <option value="Sick">Sick</option>
                      <option value="Quarantined">Quarantined</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Breed</label>
                  <input 
                    required
                    type="text" 
                    list="breed-suggestions"
                    value={formData.breed}
                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                    className="w-full glass-input" 
                    placeholder="e.g. Berkshire, Leghorn"
                  />
                  <datalist id="breed-suggestions">
                    {formData.type === 'Pig' ? (
                      <>
                        <option value="Berkshire" />
                        <option value="Tamworth" />
                        <option value="Duroc" />
                        <option value="Hampshire" />
                        <option value="Landrace" />
                        <option value="Yorkshire" />
                      </>
                    ) : (
                      <>
                        <option value="Leghorn" />
                        <option value="Sussex" />
                        <option value="Plymouth Rock" />
                        <option value="Rhode Island Red" />
                        <option value="Orpington" />
                        <option value="Brahma" />
                      </>
                    )}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Age (Months)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                    className="w-full glass-input" 
                    placeholder="Enter age"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Photo URL (Optional)</label>
                  <input 
                    type="url" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full glass-input" 
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-[10px] text-slate-600">Leave empty to use default farm photos.</p>
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
                    {editingId ? 'Update' : 'Save'} Record
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

export default Animals;
