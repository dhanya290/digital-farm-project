import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create default profile
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'staff', // Default role
          createdAt: new Date().toISOString()
        });
      }
      navigate('/');
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-6"
          >
            <ShieldCheck size={40} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-white text-center">
            FarmSecure <span className="text-emerald-500">AI</span>
          </h1>
          <p className="text-slate-400 text-center mt-2">
            Digital Biosecurity Management Portal
          </p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full glass-button flex items-center justify-center gap-3 py-4 group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span>Continue with Google</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <button 
            className="w-full py-3 px-6 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <Globe size={18} />
            <span>Explore Portal</span>
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest">
            <Sparkles size={14} className="text-emerald-500" />
            <span>Powered by Gemini 3 Flash</span>
          </div>
          <p className="text-[10px] text-slate-600 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
