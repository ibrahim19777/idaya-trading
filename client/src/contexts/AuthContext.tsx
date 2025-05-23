import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, appleProvider } from '@/lib/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const response = await apiRequest('POST', '/api/auth/login', {
            email: firebaseUser.email,
            firebaseUid: firebaseUser.uid
          });
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          // User doesn't exist in our database, create them
          if (firebaseUser.email && firebaseUser.displayName) {
            try {
              const response = await apiRequest('POST', '/api/auth/register', {
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                firebaseUid: firebaseUser.uid,
                isAdmin: false
              });
              const newUser = await response.json();
              setUser(newUser);
            } catch (createError) {
              console.error('Failed to create user:', createError);
            }
          }
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    try {
      console.log('بدء تسجيل الدخول بـ Google...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('تم تسجيل الدخول بـ Google بنجاح:', result.user);
    } catch (error: any) {
      console.error('تفاصيل خطأ Google:', {
        code: error.code,
        message: error.message,
        details: error
      });
      
      // رسائل خطأ واضحة للمستخدم
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('تم إغلاق نافذة تسجيل الدخول');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('النطاق غير مصرح به في Firebase');
      } else {
        throw new Error('خطأ في تسجيل الدخول بـ Google');
      }
    }
  };

  const loginWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      console.log('تم تسجيل الدخول بـ Apple بنجاح:', result.user);
    } catch (error) {
      console.error('خطأ في تسجيل الدخول بـ Apple:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user in our database
    await apiRequest('POST', '/api/auth/register', {
      email,
      name,
      firebaseUid: credential.user.uid,
      isAdmin: false
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      login,
      loginWithGoogle,
      loginWithApple,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
