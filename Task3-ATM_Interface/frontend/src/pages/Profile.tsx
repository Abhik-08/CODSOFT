import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, 
  FiShield, 
  FiLock, 
  FiSliders, 
  FiCreditCard, 
  FiCheck, 
  FiLogOut, 
  FiMail, 
  FiCalendar, 
  FiClock, 
  FiArrowUpRight, 
  FiArrowDownLeft 
} from 'react-icons/fi';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { VirtualCard } from '../components/dashboard/VirtualCard';
import api from '../services/apiService';

interface ActivityItem {
  id: string;
  type: 'security' | 'transaction' | 'settings';
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  detail: string;
  date: string;
  status: 'success' | 'warning' | 'info';
  colorClass: string;
}

const mockActivity: ActivityItem[] = [
  { 
    id: 'act-1', 
    type: 'security', 
    icon: FiLock, 
    desc: 'ATM PIN code updated', 
    detail: 'Authorized at Node_04 SF', 
    date: '2 hours ago', 
    status: 'success',
    colorClass: 'text-accent bg-accent/10 border-accent/15'
  },
  { 
    id: 'act-2', 
    type: 'transaction', 
    icon: FiArrowUpRight, 
    desc: 'Cash Withdrawal Outflow', 
    detail: 'Dispensed ₹200.00 | Ref: REF_9918231', 
    date: '1 day ago', 
    status: 'success',
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/15'
  },
  { 
    id: 'act-3', 
    type: 'settings', 
    icon: FiSliders, 
    desc: 'Withdrawal Limit Updated', 
    detail: 'Daily limit cap set to ₹20,000.00', 
    date: '2 days ago', 
    status: 'success',
    colorClass: 'text-primary bg-primary/10 border-primary/15'
  },
  { 
    id: 'act-4', 
    type: 'transaction', 
    icon: FiArrowDownLeft, 
    desc: 'Cash Deposit Inflow', 
    detail: 'Envelope audit ₹1,500.00 | Ref: REF_0192837', 
    date: '3 days ago', 
    status: 'success',
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15'
  },
  { 
    id: 'act-5', 
    type: 'security', 
    icon: FiShield, 
    desc: 'Card Freeze Status Synced', 
    detail: 'Local encryption database locked/unlocked', 
    date: 'Last week', 
    status: 'success',
    colorClass: 'text-secondary bg-secondary/10 border-secondary/15'
  },
];

const getDisplayTier = (tierValue: string) => {
  switch (tierValue) {
    case 'Premium Checking Tier-1':
      return 'TIER_1_VIP';
    case 'Standard Checking Tier-2':
      return 'TIER_2_STANDARD';
    case 'VIP Elite Vault':
      return 'VIP_ELITE_VAULT';
    case 'Developer Sandbox Node':
      return 'DEVELOPER_BYPASS';
    default:
      return 'TIER_1_VIP';
  }
};

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isFrozen, setIsFrozen] = useState(() => {
    return localStorage.getItem('apex_card_frozen') === 'true';
  });
  const [limit, setLimit] = useState(() => {
    const saved = localStorage.getItem('profile_daily_limit');
    return saved ? Number.parseInt(saved) : 20000;
  });
  
  // Profile editable fields
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('profile_name') || user?.displayName || 'ABHIK MUKHERJEE';
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    return localStorage.getItem('profile_email') || user?.email || 'pin.operator@nexus.bank';
  });
  const [profileCardNumber, setProfileCardNumber] = useState(() => {
    return localStorage.getItem('profile_card_number') || '4532781290128910';
  });
  const [profileExpiry, setProfileExpiry] = useState(() => {
    return localStorage.getItem('profile_expiry') || '06/31';
  });
  const [profileIdentityCode, setProfileIdentityCode] = useState(() => {
    return localStorage.getItem('profile_identity_code') || 'NEXUS_8910';
  });
  const [profileRoutingNumber, setProfileRoutingNumber] = useState(() => {
    return localStorage.getItem('profile_routing_number') || 'RTN_021000021';
  });
  const [profileNodeAssociation, setProfileNodeAssociation] = useState(() => {
    return localStorage.getItem('profile_node_association') || 'NEXUS_NODE_04 (SF)';
  });
  const [profileClassTier, setProfileClassTier] = useState(() => {
    return localStorage.getItem('profile_class_tier') || 'Premium Checking Tier-1';
  });

  const [isEditing, setIsEditing] = useState(false);

  // PIN change states
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  const handleCardFreeze = () => {
    const next = !isFrozen;
    setIsFrozen(next);
    localStorage.setItem('apex_card_frozen', String(next));
    if (next) {
      toast.success('Debit card frozen. All terminal operations suspended.');
    } else {
      toast.success('Debit card active. Terminal access restored.');
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseInt(e.target.value);
    setLimit(val);
  };

  const handleLimitSave = async () => {
    const toastId = toast.loading('Syncing daily limit with secure ledger...');
    try {
      await api.post('/account/limit', { limit });
      localStorage.setItem('profile_daily_limit', String(limit));
      toast.success(`Daily withdrawal limit set to ₹${limit.toLocaleString('en-IN')}`, { id: toastId });
      globalThis.dispatchEvent(new Event('profile_update'));
    } catch (error: any) {
      console.error(error);
      const serverMessage = error.response?.data?.message;
      toast.error(serverMessage || error.message || 'Failed to update daily limit on backend', { id: toastId });
    }
  };

  const handleSaveProfile = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Cardholder Name cannot be empty');
      return;
    }
    if (profileCardNumber.replace(/\D/g, '').length !== 16) {
      toast.error('Card Number must be exactly 16 digits');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(profileExpiry)) {
      toast.error('Expiry Date must be in MM/YY format');
      return;
    }

    localStorage.setItem('profile_name', profileName);
    localStorage.setItem('profile_email', profileEmail);
    localStorage.setItem('profile_card_number', profileCardNumber.replace(/\D/g, ''));
    localStorage.setItem('profile_expiry', profileExpiry);
    localStorage.setItem('profile_identity_code', profileIdentityCode);
    localStorage.setItem('profile_routing_number', profileRoutingNumber);
    localStorage.setItem('profile_node_association', profileNodeAssociation);
    localStorage.setItem('profile_class_tier', profileClassTier);

    setIsEditing(false);
    toast.success('Details updated successfully!');
    
    // Dispatch event to sync state across tabs/windows
    globalThis.dispatchEvent(new Event('profile_update'));
  };

  const handlePinChange = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      toast.error('All PIN entries must be exactly 4 digits');
      return;
    }

    const userPinKey = user ? `profile_pin_${user.uid}` : 'profile_pin';
    const storedPin = localStorage.getItem(userPinKey) || localStorage.getItem('profile_pin') || '8910';
    if (oldPin !== storedPin) {
      toast.error('Current PIN code is incorrect');
      return;
    }

    if (newPin === oldPin) {
      toast.error('New PIN cannot be the same as current PIN');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('New PIN does not match confirmation PIN');
      return;
    }

    if (newPin === '1234' || newPin === '0000' || newPin === '1111') {
      toast.error('Security Alert: Simple PINs (e.g. 1234, 0000) are not allowed.');
      return;
    }
    
    setIsChangingPin(true);
    const toastId = toast.loading('Syncing security database...');
    
    setTimeout(() => {
      localStorage.setItem(userPinKey, newPin);
      localStorage.setItem('profile_pin', newPin); // Legacy fallback
      toast.success('Passcode PIN successfully updated!', { id: toastId });
      setIsChangingPin(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    }, 1500);
  };

  const handleLogout = async () => {
    const toastId = toast.loading('Terminating secure session...');
    try {
      await logout();
      toast.success('Logged out successfully. Secure session ended.', { id: toastId });
      navigate('/login');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed.';
      toast.error(errorMsg, { id: toastId });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. Header Profile Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card premium-card-shadow rounded-3xl p-6 border border-dark-border/15 light:border-light-border/40 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar Photo Frame with Glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <img 
                src={user?.photoURL || "/avatar.png"} 
                alt="Operator Profile" 
                className="w-24 h-24 rounded-2xl border-2 border-white/10 relative z-10 object-cover shadow-2xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h1 className="font-display font-black text-2xl md:text-3xl text-dark-text light:text-light-text tracking-tight">
                  {profileName}
                </h1>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  {getDisplayTier(profileClassTier)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-xs text-dark-text/60 light:text-light-text/60 font-mono">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-secondary" />
                  <span>{profileEmail}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-accent" />
                  <span>
                    Joined {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sept 24, 2024'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto py-3 px-6 rounded-2xl font-display font-bold text-xs uppercase tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-transparent hover:shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 active:scale-[0.98]"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Terminate Session</span>
          </button>
          
        </div>
      </motion.div>

      {/* 2. Main content split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Account Overview & Configs */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section title */}
          <div className="pl-1 flex justify-between items-center">
            <div>
              <h2 className="font-display font-extrabold text-[15px] text-dark-text light:text-light-text uppercase tracking-widest flex items-center gap-2">
                <FiUser className="w-4.5 h-4.5 text-primary" /> Account Overview
              </h2>
              <p className="text-[11px] text-dark-text/45 light:text-light-text/50 font-mono mt-0.5">
                Identity parameters, security settings, and cards
              </p>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="py-1.5 px-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-dark-card/60 hover:bg-dark-card border border-dark-border/15 text-dark-text light:text-light-text cursor-pointer transition-all duration-200"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>
          </div>

          {/* Overview Grid */}
          <motion.div
            layout
            className="glass-card premium-card-shadow rounded-3xl p-6 border border-dark-border/15 light:border-light-border/40"
          >
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cardholder Name */}
                  <div className="space-y-1">
                    <label htmlFor="profileName" className="text-[9px] font-mono text-dark-text/40 light:text-light-text/40 uppercase tracking-wider block">Cardholder Name</label>
                    <input
                      id="profileName"
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 outline-none text-[12px] text-dark-text light:text-light-text focus:border-primary/50"
                    />
                  </div>

                  {/* Operator Email */}
                  <div className="space-y-1">
                    <label htmlFor="profileEmail" className="text-[9px] font-mono text-dark-text/40 light:text-light-text/40 uppercase tracking-wider block">Operator Email</label>
                    <input
                      id="profileEmail"
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 outline-none text-[12px] text-dark-text light:text-light-text focus:border-primary/50"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <label htmlFor="profileCardNumber" className="text-[9px] font-mono text-dark-text/40 light:text-light-text/40 uppercase tracking-wider block">Debit Card Number (16 digits)</label>
                    <input
                      id="profileCardNumber"
                      type="text"
                      maxLength={16}
                      value={profileCardNumber}
                      onChange={(e) => setProfileCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 outline-none text-[12px] text-dark-text light:text-light-text focus:border-primary/50 font-mono"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-1">
                    <label htmlFor="profileExpiry" className="text-[9px] font-mono text-dark-text/40 light:text-light-text/40 uppercase tracking-wider block">Expiry Date (MM/YY)</label>
                    <input
                      id="profileExpiry"
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={profileExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d/]/g, '');
                        if (val.length === 2 && !val.includes('/')) {
                          val += '/';
                        }
                        setProfileExpiry(val);
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 outline-none text-[12px] text-dark-text light:text-light-text focus:border-primary/50 font-mono"
                    />
                  </div>

                  {/* User Identity Code */}
                  <div className="space-y-1">
                    <label htmlFor="profileIdentityCode" className="text-[9px] font-mono text-dark-text/40 light:text-light-text/40 uppercase tracking-wider block">Identity Code</label>
                    <input
                      id="profileIdentityCode"
                      type="text"
                      value={profileIdentityCode}
                      onChange={(e) => setProfileIdentityCode(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 outline-none text-[12px] text-dark-text light:text-light-text focus:border-primary/50 font-mono"
                    />
                  </div>

                  {/* Routing Number */}
                  <div className="space-y-1">
                    <label htmlFor="profileRoutingNumber" className="text-[9px] font-mono text-dark-text/40 light:text-light-text/40 uppercase tracking-wider block">Routing Number</label>
                    <input
                      id="profileRoutingNumber"
                      type="text"
                      value={profileRoutingNumber}
                      onChange={(e) => setProfileRoutingNumber(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 outline-none text-[12px] text-dark-text light:text-light-text focus:border-primary/50 font-mono"
                    />
                  </div>

                  {/* Primary Node Association */}
                  <div className="space-y-1">
                    <label htmlFor="profileNodeAssociation" className="text-[9px] font-mono text-dark-text/40 light:text-light-text/40 uppercase tracking-wider block">Node Association</label>
                    <input
                      id="profileNodeAssociation"
                      type="text"
                      value={profileNodeAssociation}
                      onChange={(e) => setProfileNodeAssociation(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 outline-none text-[12px] text-dark-text light:text-light-text focus:border-primary/50 font-mono"
                    />
                  </div>

                  {/* Account Class Tier */}
                  <div className="space-y-1">
                    <label htmlFor="profileClassTier" className="text-[9px] font-mono text-dark-text/40 light:text-light-text/40 uppercase tracking-wider block">Class Tier</label>
                    <select
                      id="profileClassTier"
                      value={profileClassTier}
                      onChange={(e) => setProfileClassTier(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 outline-none text-[12px] text-[var(--text-primary)] light:text-light-text focus:border-primary/50"
                    >
                      <option value="Premium Checking Tier-1">Premium Checking Tier-1</option>
                      <option value="Standard Checking Tier-2">Standard Checking Tier-2</option>
                      <option value="VIP Elite Vault">VIP Elite Vault</option>
                      <option value="Developer Sandbox Node">Developer Sandbox Node</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileName(localStorage.getItem('profile_name') || user?.displayName || 'ABHIK MUKHERJEE');
                      setProfileEmail(localStorage.getItem('profile_email') || user?.email || 'pin.operator@nexus.bank');
                      setProfileCardNumber(localStorage.getItem('profile_card_number') || '4532781290128910');
                      setProfileExpiry(localStorage.getItem('profile_expiry') || '06/31');
                      setProfileIdentityCode(localStorage.getItem('profile_identity_code') || 'NEXUS_8910');
                      setProfileRoutingNumber(localStorage.getItem('profile_routing_number') || 'RTN_021000021');
                      setProfileNodeAssociation(localStorage.getItem('profile_node_association') || 'NEXUS_NODE_04 (SF)');
                      setProfileClassTier(localStorage.getItem('profile_class_tier') || 'Premium Checking Tier-1');
                      setIsEditing(false);
                    }}
                    className="py-2.5 px-5 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-dark-surface/30 border border-dark-border/10 text-dark-text light:text-light-text cursor-pointer transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div className="flex flex-col bg-dark-card/25 light:bg-light-card/15 p-3 rounded-2xl border border-dark-border/5 light:border-light-border/20">
                  <span className="text-[10px] font-mono text-dark-text/40 light:text-light-text/40 uppercase">User Identity Code</span>
                  <span className="text-[13px] font-mono font-bold text-dark-text light:text-light-text mt-0.5">{profileIdentityCode}</span>
                </div>
                <div className="flex flex-col bg-dark-card/25 light:bg-light-card/15 p-3 rounded-2xl border border-dark-border/5 light:border-light-border/20">
                  <span className="text-[10px] font-mono text-dark-text/40 light:text-light-text/40 uppercase">Account Routing Number</span>
                  <span className="text-[13px] font-mono font-bold text-dark-text light:text-light-text mt-0.5">{profileRoutingNumber}</span>
                </div>
                <div className="flex flex-col bg-dark-card/25 light:bg-light-card/15 p-3 rounded-2xl border border-dark-border/5 light:border-light-border/20">
                  <span className="text-[10px] font-mono text-dark-text/40 light:text-light-text/40 uppercase">Primary Node Association</span>
                  <span className="text-[13px] font-mono font-bold text-dark-text light:text-light-text mt-0.5">{profileNodeAssociation}</span>
                </div>
                <div className="flex flex-col bg-dark-card/25 light:bg-light-card/15 p-3 rounded-2xl border border-dark-border/5 light:border-light-border/20">
                  <span className="text-[10px] font-mono text-dark-text/40 light:text-light-text/40 uppercase">Account Class Tier</span>
                  <span className="text-[13px] font-mono font-bold text-primary mt-0.5">{profileClassTier}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Card Controls & Limit Adjuster */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card premium-card-shadow rounded-3xl p-6 border border-dark-border/15 light:border-light-border/40 space-y-6"
          >
            {/* Card Freeze Toggle */}
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-[15px] text-dark-text light:text-light-text uppercase tracking-wider flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5 text-secondary" /> Card Lockdown
                </h3>
                <p className="text-[11px] text-dark-text/40 light:text-light-text/40">
                  Instantly freeze debit actions across all ATM terminals
                </p>
              </div>
              <button
                type="button"
                onClick={handleCardFreeze}
                aria-label="Toggle card lockdown freeze status"
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/45 ${
                  isFrozen ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.35)]' : 'bg-dark-border/40 light:bg-light-border/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    isFrozen ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Withdrawal Adjuster Slider */}
            <div className="border-t border-dark-border/10 light:border-light-border/40 pt-6 space-y-4">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-[15px] text-dark-text light:text-light-text uppercase tracking-wider flex items-center gap-2">
                  <FiSliders className="w-5 h-5 text-accent" /> Withdrawal Adjuster
                </h3>
                <p className="text-[11px] text-dark-text/40 light:text-light-text/40">
                  Configure maximum daily banknotes value you can withdraw
                </p>
              </div>

              <div className="space-y-3 bg-dark-surface/30 light:bg-light-surface/40 p-4.5 rounded-2xl border border-dark-border/5 light:border-light-border/20">
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={limit}
                  onChange={handleLimitChange}
                  className="w-full h-1.5 bg-dark-border/20 light:bg-light-border/80 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-xs font-mono text-dark-text/50 light:text-light-text/50 items-center">
                  <span>Min: ₹1,000</span>
                  <span className="font-black text-primary font-display text-[15px] bg-primary/10 border border-primary/15 px-3 py-1 rounded-lg">
                    ₹{limit.toLocaleString('en-IN')}
                  </span>
                  <span>Max: ₹50,000</span>
                </div>
              </div>

              <button
                onClick={handleLimitSave}
                className="py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider bg-dark-card/60 hover:bg-dark-card hover:border-primary/50 border border-dark-border/15 light:border-light-border/40 text-dark-text light:text-light-text flex items-center gap-2 cursor-pointer transition-all duration-200"
              >
                <FiCheck className="w-4 h-4 text-primary" />
                <span>Save Limit Preference</span>
              </button>
            </div>
          </motion.div>

          {/* Secure Passcode Reset Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card premium-card-shadow rounded-3xl p-6 border border-dark-border/15 light:border-light-border/40"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <FiLock className="w-5 h-5 text-accent" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-[15px] text-dark-text light:text-light-text uppercase tracking-wider">Passcode Vault</h3>
                <p className="text-[11px] text-dark-text/40 light:text-light-text/40 font-mono">Configure secure 4-digit PIN credentials</p>
              </div>
            </div>

            <form onSubmit={handlePinChange} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Old Pin */}
                <div className="space-y-1.5">
                  <label htmlFor="old-pin-input" className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">Current PIN</label>
                  <div className="relative rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-200">
                    <input
                      id="old-pin-input"
                      type="password"
                      maxLength={4}
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                      disabled={isChangingPin}
                      placeholder="••••"
                      autoComplete="current-password"
                      className="w-full py-2.5 px-4 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-mono tracking-[6px] text-center placeholder-dark-text/15 light:placeholder-light-text/20"
                    />
                  </div>
                </div>

                {/* New Pin */}
                <div className="space-y-1.5">
                  <label htmlFor="new-pin-input" className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">New PIN</label>
                  <div className="relative rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-200">
                    <input
                      id="new-pin-input"
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      disabled={isChangingPin}
                      placeholder="••••"
                      autoComplete="new-password"
                      className="w-full py-2.5 px-4 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-mono tracking-[6px] text-center placeholder-dark-text/15 light:placeholder-light-text/20"
                    />
                  </div>
                </div>

                {/* Confirm Pin */}
                <div className="space-y-1.5">
                  <label htmlFor="confirm-pin-input" className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">Confirm PIN</label>
                  <div className="relative rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/80 flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-200">
                    <input
                      id="confirm-pin-input"
                      type="password"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      disabled={isChangingPin}
                      placeholder="••••"
                      autoComplete="new-password"
                      className="w-full py-2.5 px-4 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-mono tracking-[6px] text-center placeholder-dark-text/15 light:placeholder-light-text/20"
                    />
                  </div>
                </div>
              </div>

              {/* Security Shield status warning */}
              <div className="flex gap-2.5 items-start text-[10px] text-dark-text/40 light:text-light-text/40 font-sans leading-relaxed">
                <FiShield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>PIN updates occur instantly. Once submitted, your card swipe will reject the old passcode credentials at all terminal slots.</span>
              </div>

              {/* Action */}
              <button
                type="submit"
                disabled={isChangingPin || oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4}
                className="w-full py-3 rounded-xl font-display font-bold text-[11px] uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Commit PIN Update</span>
              </button>

            </form>
          </motion.div>
        </div>

        {/* Right Column: Recent Activity & Virtual Card display */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Card Presentation Desk */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-1">
              Interactive Card Desk
            </span>
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-center"
            >
              <VirtualCard
                name={profileName.toUpperCase()}
                cardNumber={profileCardNumber}
                expiry={profileExpiry}
                isFrozen={isFrozen}
              />
            </motion.div>
          </div>

          {/* Recent Activity Logs */}
          <div className="space-y-3">
            <div className="pl-1">
              <h2 className="font-display font-extrabold text-[15px] text-dark-text light:text-light-text uppercase tracking-widest flex items-center gap-2">
                <FiClock className="w-4.5 h-4.5 text-secondary" /> Recent Activity
              </h2>
              <p className="text-[11px] text-dark-text/45 light:text-light-text/50 font-mono mt-0.5">
                Audit history of recent actions and logs
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card premium-card-shadow rounded-3xl p-5 border border-dark-border/15 light:border-light-border/40 space-y-4"
            >
              <div className="flow-root">
                <ul className="-mb-8">
                  {mockActivity.map((act, actIdx) => {
                    const Icon = act.icon;
                    return (
                      <li key={act.id}>
                        <div className="relative pb-8">
                          {actIdx < mockActivity.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-dark-border/10 light:bg-light-border/40" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3.5">
                            <div>
                              <span className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center border ${act.colorClass}`}>
                                <Icon className="w-4 h-4" />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="text-[12px] font-bold text-dark-text light:text-light-text flex justify-between items-start">
                                <span>{act.desc}</span>
                                <span className="text-[10px] font-mono font-medium text-dark-text/35 light:text-light-text/40 whitespace-nowrap pl-2">
                                  {act.date}
                                </span>
                              </div>
                              <p className="text-[10px] font-mono text-dark-text/50 light:text-light-text/50 mt-0.5 leading-normal">
                                {act.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </div>

        </div>

      </div>

    </div>
  );
};


