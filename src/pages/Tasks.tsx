import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  User as UserIcon,
  Calendar,
  MoreVertical,
  Trash2,
  Check
} from 'lucide-react';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Task, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Tasks: React.FC = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager';
  const canAssign = isAdmin || isManager;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium' as Task['priority'],
  });

  useEffect(() => {
    const q = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    // Fetch users for assignment
    const usersQ = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(data);
    });

    return () => {
      unsubscribe();
      unsubscribeUsers();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const taskData = {
        ...formData,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'tasks'), taskData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', assignedTo: '', dueDate: new Date().toISOString().split('T')[0], priority: 'Medium' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: Task['status']) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const getUserName = (uid: string) => {
    return users.find(u => u.uid === uid)?.displayName || 'Unknown User';
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Task Management</h1>
          <p className="text-slate-500 mt-1">Assign and track farm operations and maintenance</p>
        </div>
        {canAssign && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="glass-button flex items-center gap-2 shadow-xl shadow-emerald-500/20"
          >
            <Plus size={20} />
            <span>New Task</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Search tasks..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full glass-input pl-12"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map((task) => (
          <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={task.id}
            className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <h3 className={`text-lg font-bold ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                  {task.title}
                </h3>
              </div>
              <p className="text-sm text-slate-400">{task.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <UserIcon size={14} />
                  <span>Assigned to: <span className="text-slate-300">{getUserName(task.assignedTo)}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Due: <span className="text-slate-300">{new Date(task.dueDate).toLocaleDateString()}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  task.status === 'Completed' ? 'text-emerald-500' : 
                  task.status === 'In Progress' ? 'text-blue-400' : 'text-amber-500'
                }`}>
                  {task.status}
                </span>
                <div className="flex gap-2">
                  {task.status !== 'Completed' && (
                    <button 
                      onClick={() => handleStatusUpdate(task.id, task.status === 'Pending' ? 'In Progress' : 'Completed')}
                      className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      {task.status === 'Pending' ? <Clock size={16} /> : <Check size={16} />}
                    </button>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
                <h3 className="text-2xl font-display font-bold text-white">Create New Task</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Task Title</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full glass-input" 
                    placeholder="e.g. Clean Sanitation Zone A"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full glass-input min-h-[100px] py-3" 
                    placeholder="Detailed instructions..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assign To</label>
                    <select 
                      required
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                      className="w-full glass-input appearance-none"
                    >
                      <option value="">Select User</option>
                      {users.map(u => (
                        <option key={u.uid} value={u.uid}>{u.displayName} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full glass-input appearance-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Due Date</label>
                  <input 
                    required
                    type="date" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full glass-input" 
                  />
                </div>

                <button type="submit" className="w-full glass-button py-4 shadow-xl shadow-emerald-500/20">
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
