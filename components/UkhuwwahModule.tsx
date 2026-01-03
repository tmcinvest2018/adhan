
import React, { useState, useEffect } from 'react';
import { UkhuwwahProfile, UkhuwwahRole, Gender, ConnectionRequest } from '../types';
import { UkhuwwahService } from '../services/ukhuwwahService';
import { Users, ShieldCheck, UserPlus, QrCode, Scan, LogIn, Check, X, HandHeart, MessageCircle } from 'lucide-react';

interface Props {
  t: any;
}

export const UkhuwwahModule: React.FC<Props> = ({ t }) => {
  const [currentUser, setCurrentUser] = useState<UkhuwwahProfile | null>(UkhuwwahService.getCurrentUser());
  const [feed, setFeed] = useState<UkhuwwahProfile[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<UkhuwwahRole>('muakhi');
  const [authGender, setAuthGender] = useState<Gender>('brother');

  // Dashboard State
  const [myRequests, setMyRequests] = useState<ConnectionRequest[]>([]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
      setFeed(UkhuwwahService.getFeed(currentUser));
      if (currentUser) {
          setMyRequests(UkhuwwahService.getPendingRequests(currentUser.id));
      }
  };

  const handleLogin = () => {
      if (!authName.trim()) return;
      const user = UkhuwwahService.login(authName, authRole, authGender);
      setCurrentUser(user);
      setShowAuthModal(false);
  };

  const handleLogout = () => {
      UkhuwwahService.logout();
      setCurrentUser(null);
  };

  const requireAuth = (action: () => void) => {
      if (!currentUser) {
          setShowAuthModal(true);
      } else {
          action();
      }
  };

  const handleConnect = (targetUserId: string) => {
      requireAuth(() => {
          if (currentUser) {
            UkhuwwahService.sendRequest(currentUser, targetUserId, 'mentorship');
            alert('Connection request sent!');
          }
      });
  };

  const handleScanQR = () => {
      requireAuth(() => {
          if (currentUser) {
              const updated = UkhuwwahService.scanMosqueQR(currentUser);
              setCurrentUser(updated);
              alert('Scanned successfully! Verification request sent to Mosque Admin.');
          }
      });
  };

  const handleRequestResponse = (reqId: string, status: 'accepted' | 'rejected') => {
      UkhuwwahService.respondToRequest(reqId, status);
      loadData(); // Refresh list
  };

  // --- SUB-COMPONENTS ---

  const AuthModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.ukhuwwah.login}</h2>
              <p className="text-gray-500 mb-6 text-sm">Join to connect with your community.</p>

              <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Name</label>
                      <input 
                        value={authName} 
                        onChange={e => setAuthName(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Your Name"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.ukhuwwah.role_select}</label>
                      <div className="grid grid-cols-1 gap-2">
                          {(['muakhi', 'nasir', 'wakeel'] as UkhuwwahRole[]).map(r => (
                              <button 
                                key={r}
                                onClick={() => setAuthRole(r)}
                                className={`p-3 rounded-xl text-left font-medium transition-all ${authRole === r ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600'}`}
                              >
                                  <span className="block text-sm font-bold">{t.ukhuwwah.roles[r].split('(')[0]}</span>
                                  <span className="block text-[10px] opacity-80">{r === 'wakeel' ? 'Mosque Admin' : r === 'nasir' ? 'Helper/Mentor' : 'Newcomer'}</span>
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.ukhuwwah.gender_select}</label>
                       <div className="flex gap-3">
                           <button onClick={() => setAuthGender('brother')} className={`flex-1 p-3 rounded-xl font-bold ${authGender === 'brother' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}>Brother</button>
                           <button onClick={() => setAuthGender('sister')} className={`flex-1 p-3 rounded-xl font-bold ${authGender === 'sister' ? 'bg-pink-600 text-white' : 'bg-gray-50 text-gray-600'}`}>Sister</button>
                       </div>
                  </div>
                  <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black shadow-lg mt-4">
                      {t.ukhuwwah.login}
                  </button>
                  <button onClick={() => setShowAuthModal(false)} className="w-full py-2 text-gray-400 text-sm font-bold">Cancel</button>
              </div>
          </div>
      </div>
  );

  const DashboardHeader = () => (
      <div className="bg-gradient-to-br from-emerald-700 to-teal-800 p-6 rounded-3xl text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="relative z-10 flex justify-between items-start">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {currentUser?.role}
                      </span>
                      {currentUser?.isVerified && <ShieldCheck size={14} className="text-emerald-300" />}
                  </div>
                  <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
                  <p className="text-emerald-100 text-sm">{currentUser?.mosqueName || 'No Mosque Affiliated'}</p>
              </div>
              <button onClick={handleLogout} className="text-xs bg-black/20 px-3 py-1.5 rounded-lg hover:bg-black/30 transition-colors">Log Out</button>
          </div>
          
          {/* Action Bar based on Role */}
          <div className="flex gap-2 mt-6">
              {currentUser?.role === 'wakeel' && (
                  <button className="flex-1 bg-white text-emerald-800 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2">
                      <QrCode size={18} /> {t.ukhuwwah.my_qr}
                  </button>
              )}
              {currentUser?.role === 'muakhi' && (
                  <button onClick={handleScanQR} className="flex-1 bg-white text-emerald-800 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                      <Scan size={18} /> {t.ukhuwwah.scan}
                  </button>
              )}
               {currentUser?.role === 'nasir' && (
                  <div className="flex-1 bg-emerald-600/50 border border-emerald-500/30 text-emerald-50 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                      <Check size={16} /> Open for Mentorship
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col pb-24 px-1 animate-in fade-in">
        {/* Header Title */}
        <div className="py-4 px-2">
            <h1 className="text-2xl font-bold text-gray-800">{t.ukhuwwah.title}</h1>
            <p className="text-gray-500 text-sm">{t.ukhuwwah.subtitle}</p>
        </div>

        {/* Auth Guard Banner */}
        {!currentUser && (
            <div 
                onClick={() => setShowAuthModal(true)}
                className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform mx-1"
            >
                <div className="bg-amber-100 text-amber-600 p-3 rounded-full"><LogIn size={20} /></div>
                <div>
                    <h3 className="font-bold text-gray-800">{t.ukhuwwah.login}</h3>
                    <p className="text-xs text-gray-500">{t.ukhuwwah.guest_banner}</p>
                </div>
                <Users className="ml-auto text-amber-200" size={32} />
            </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            
            {currentUser && <DashboardHeader />}

            {/* Request List (For Wakeel and Nasir) */}
            {currentUser && (currentUser.role === 'wakeel' || currentUser.role === 'nasir') && (
                <div className="px-1">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        {t.ukhuwwah.pending_requests} 
                        {myRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{myRequests.length}</span>}
                    </h3>
                    {myRequests.length === 0 ? (
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center text-gray-400 text-sm italic">
                            {t.ukhuwwah.no_requests}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {myRequests.map(req => (
                                <div key={req.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800">{req.fromName}</p>
                                        <p className="text-xs text-gray-500 capitalize">{req.type} Request</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRequestResponse(req.id, 'accepted')} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Check size={18} /></button>
                                        <button onClick={() => handleRequestResponse(req.id, 'rejected')} className="p-2 bg-red-100 text-red-600 rounded-lg"><X size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Public/Discovery Feed */}
            <div className="px-1">
                <h3 className="font-bold text-gray-800 mb-3">{t.ukhuwwah.feed}</h3>
                <div className="grid gap-3">
                    {feed.map(user => (
                        <div key={user.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-center">
                            <div className={`w-12 h-12 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-bold text-lg`}>
                                {user.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-800 truncate">{user.name}</h4>
                                    {user.isVerified && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{user.mosqueName}</p>
                                <p className="text-xs text-gray-400 italic mt-0.5 truncate">{user.bio}</p>
                            </div>
                            <button 
                                onClick={() => handleConnect(user.id)}
                                disabled={currentUser?.id === user.id} // Can't connect to self
                                className={`p-2.5 rounded-xl transition-colors ${currentUser?.id === user.id ? 'bg-gray-50 text-gray-300' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            >
                                <UserPlus size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Safe Area Spacer */}
            <div className="h-10"></div>
        </div>

        {showAuthModal && <AuthModal />}
    </div>
  );
};
