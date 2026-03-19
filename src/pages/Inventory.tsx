import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  RefreshCw, 
  X,
  Edit2,
  Trash2,
  Filter,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { InventoryItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Inventory: React.FC = () => {
  const { profile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager';
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin;

  const [formData, setFormData] = useState({
    name: '',
    category: 'Feed' as InventoryItem['category'],
    quantity: 0,
    unit: 'kg',
    minThreshold: 10,
  });

  useEffect(() => {
    const q = query(collection(db, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inventory');
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const itemData = {
        ...formData,
        lastUpdated: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'inventory', editingId), itemData);
      } else {
        await addDoc(collection(db, 'inventory'), itemData);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', category: 'Feed', quantity: 0, unit: 'kg', minThreshold: 10 });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'inventory');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inventory/${id}`);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minThreshold: item.minThreshold,
    });
    setIsModalOpen(true);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Monitor and manage farm supplies and stock levels</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', category: 'Feed', quantity: 0, unit: 'kg', minThreshold: 10 });
              setIsModalOpen(true);
            }}
            className="glass-button flex items-center gap-2 shadow-xl shadow-emerald-500/20"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-12"
          />
        </div>
        <div className="glass-card px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">Low Stock Items</span>
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-xs font-bold">
            {items.filter(i => i.quantity <= i.minThreshold).length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isLowStock = item.quantity <= item.minThreshold;
          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.id}
              className="glass-card p-6 group relative overflow-hidden"
            >
              {isLowStock && (
                <div className="absolute top-0 right-0 p-2 bg-red-500/10 text-red-500">
                  <AlertTriangle size={16} />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-400">
                  <Package size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canEdit && (
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                      <Edit2 size={16} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{item.category}</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Quantity</p>
                  <p className={`text-xl font-display font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Threshold</p>
                  <p className="text-xl font-display font-bold text-slate-400">{item.minThreshold} {item.unit}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Last updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                {isLowStock && (
                  <span className="text-[10px] font-bold text-red-500 uppercase animate-pulse">Restock Required</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

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
                <h3 className="text-2xl font-display font-bold text-white">
                  {editingId ? 'Edit Item' : 'Add New Item'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Item Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full glass-input" 
                    placeholder="e.g. Pig Feed Type A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full glass-input appearance-none"
                    >
                      <option value="Feed">Feed</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unit</label>
                    <input 
                      required
                      type="text" 
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full glass-input" 
                      placeholder="kg, liters, pcs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quantity</label>
                    <input 
                      required
                      type="number" 
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                      className="w-full glass-input" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Min Threshold</label>
                    <input 
                      required
                      type="number" 
                      value={formData.minThreshold}
                      onChange={(e) => setFormData({...formData, minThreshold: Number(e.target.value)})}
                      className="w-full glass-input" 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full glass-button py-4 shadow-xl shadow-emerald-500/20">
                  {editingId ? 'Update Item' : 'Add Item'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
