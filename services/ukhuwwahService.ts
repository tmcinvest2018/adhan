
import { UkhuwwahProfile, ConnectionRequest, UkhuwwahRole, Gender } from '../types';

const STORAGE_KEY_USER = 'nur_ukhuwwah_user';
const STORAGE_KEY_REQUESTS = 'nur_ukhuwwah_requests';

// --- MOCK DATABASE ---
const MOCK_MOSQUES = [
    { id: 'mosque_1', name: 'Masjid Al-Noor', city: 'Amsterdam' },
    { id: 'mosque_2', name: 'Masjid Al-Ummah', city: 'Rotterdam' },
];

const MOCK_USERS: UkhuwwahProfile[] = [
    { id: 'u1', name: 'Ahmed', role: 'nasir', gender: 'brother', isVerified: true, mosqueName: 'Masjid Al-Noor', avatarColor: 'bg-blue-500', bio: 'Hafiz and youth mentor.' },
    { id: 'u2', name: 'Karim', role: 'nasir', gender: 'brother', isVerified: true, mosqueName: 'Masjid Al-Ummah', avatarColor: 'bg-emerald-500', bio: 'Helping new Muslims with Salah.' },
    { id: 'u3', name: 'Fatima', role: 'nasir', gender: 'sister', isVerified: true, mosqueName: 'Masjid Al-Noor', avatarColor: 'bg-pink-500', bio: 'Tajweed teacher for sisters.' },
    { id: 'u4', name: 'Aisha', role: 'nasir', gender: 'sister', isVerified: true, mosqueName: 'Masjid Al-Ummah', avatarColor: 'bg-purple-500', bio: 'Community organizer.' },
    { id: 'u5', name: 'Omar', role: 'muakhi', gender: 'brother', isVerified: false, avatarColor: 'bg-gray-500', bio: 'New to the city.' },
];

export const UkhuwwahService = {
    // --- AUTH & PROFILE ---
    getCurrentUser: (): UkhuwwahProfile | null => {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        return stored ? JSON.parse(stored) : null;
    },

    login: (name: string, role: UkhuwwahRole, gender: Gender): UkhuwwahProfile => {
        const newUser: UkhuwwahProfile = {
            id: `user_${Date.now()}`,
            name,
            role,
            gender,
            isVerified: role === 'wakeel', // Wakeels auto-verified in demo
            mosqueName: role === 'wakeel' ? 'Demo Masjid' : undefined,
            avatarColor: 'bg-emerald-600'
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
        return newUser;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEY_USER);
    },

    // --- FEED LOGIC (GENDER SEGREGATED) ---
    getFeed: (currentUser: UkhuwwahProfile | null): UkhuwwahProfile[] => {
        if (!currentUser) {
            // Public view: Show a mix but anonymized or limited? 
            // For demo, we show all Nasirs but interaction requires login
            return MOCK_USERS.filter(u => u.role === 'nasir');
        }
        // Logged in: Strict Gender Segregation
        return MOCK_USERS.filter(u => u.role === 'nasir' && u.gender === currentUser.gender);
    },

    // --- REQUESTS LOGIC ---
    getPendingRequests: (userId: string): ConnectionRequest[] => {
        const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
        const allRequests: ConnectionRequest[] = stored ? JSON.parse(stored) : [];
        return allRequests.filter(r => r.toId === userId && r.status === 'pending');
    },

    sendRequest: (fromUser: UkhuwwahProfile, toId: string, type: 'mentorship' | 'verification') => {
        const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
        const allRequests: ConnectionRequest[] = stored ? JSON.parse(stored) : [];
        
        const newReq: ConnectionRequest = {
            id: `req_${Date.now()}`,
            fromId: fromUser.id,
            fromName: fromUser.name,
            toId,
            type,
            status: 'pending',
            timestamp: Date.now()
        };
        
        allRequests.push(newReq);
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(allRequests));
    },

    respondToRequest: (reqId: string, status: 'accepted' | 'rejected') => {
        const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
        let allRequests: ConnectionRequest[] = stored ? JSON.parse(stored) : [];
        
        allRequests = allRequests.map(r => r.id === reqId ? { ...r, status } : r);
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(allRequests));
    },

    // --- QR LOGIC (Simulated) ---
    scanMosqueQR: (user: UkhuwwahProfile): UkhuwwahProfile => {
        // Simulates scanning a Wakeel's QR. 
        // In a real app, this takes a QR string payload.
        const updated = { ...user, mosqueName: 'Masjid Al-Noor (Scanned)', isVerified: false }; 
        // Note: Needs Wakeel approval in real flow, here we just link mosque
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
        
        // Simulate sending a verification request to the "Wakeel" of that mosque
        // For demo, we just create a dummy request that won't really go anywhere 
        // unless we logged in as that specific Wakeel.
        return updated;
    }
};
