import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Shield, MapPin, Calendar } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile }) => {
  if (!profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-md overflow-hidden relative z-10"
          >
            {/* Header/Cover */}
            <div className="h-32 bg-gradient-to-r from-emerald-600 to-blue-600 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-lg text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-emerald-500 shadow-xl">
                  <User size={48} />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-950" />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">
                    {profile.displayName || 'Farmer'}
                  </h3>
                  <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                    <Shield size={14} className="text-emerald-500" />
                    <span className="capitalize">{profile.role} Account</span>
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm text-slate-200">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Farm ID</p>
                      <p className="text-sm text-slate-200 font-mono">{profile.farmId || 'Not Assigned'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member Since</p>
                      <p className="text-sm text-slate-200">March 2026</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full py-3 mt-4 glass-button"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
