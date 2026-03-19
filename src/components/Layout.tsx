import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  BrainCircuit, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  PawPrint,
  Syringe,
  Users,
  Package,
  ClipboardList,
  BarChart3
} from 'lucide-react';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ProfileModal from './ProfileModal';

interface LayoutProps {
  children: React.ReactNode;
  profile: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, profile }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'worker', 'staff'] },
    { path: '/animals', icon: PawPrint, label: 'Animals', roles: ['admin', 'manager', 'worker', 'staff'] },
    { path: '/vaccinations', icon: Syringe, label: 'Vaccinations', roles: ['admin', 'manager', 'worker', 'staff'] },
    { path: '/visitors', icon: Users, label: 'Visitors', roles: ['admin', 'manager', 'worker', 'staff'] },
    { path: '/biosecurity', icon: ShieldCheck, label: 'Biosecurity', roles: ['admin', 'manager', 'worker', 'staff'] },
    { path: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'manager', 'worker', 'staff'] },
    { path: '/tasks', icon: ClipboardList, label: 'Tasks', roles: ['admin', 'manager', 'worker', 'staff'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'manager', 'staff'] },
    { path: '/ai-advisor', icon: BrainCircuit, label: 'AI Advisor', roles: ['admin', 'manager', 'staff'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    profile?.role && item.roles.includes(profile.role)
  );

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="glass-card m-4 mr-0 border-r-0 rounded-r-none flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold text-xl text-emerald-500"
            >
              FarmSecure
            </motion.span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' 
                    : 'hover:bg-white/5 text-slate-400'
                }`}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full flex items-center gap-4 p-3 mb-2 hover:bg-white/5 rounded-xl transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
              <UserIcon size={20} />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate">{profile?.displayName || 'Farmer'}</span>
                <span className="text-xs text-slate-500 capitalize">{profile?.role}</span>
              </div>
            )}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Background Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        profile={profile} 
      />
    </div>
  );
};

export default Layout;
