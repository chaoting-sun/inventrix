import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { fetchBalance, earnPoints } from '../points';
import { mascot } from '../mascot';

interface PointsContextType {
  balance: number | null;
  earn: () => Promise<boolean>;
  setBalance: (balance: number) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);

  const expireSession = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    mascot.setMessage(token ? null : '登入來幫我清便便！');
    setBalance(null);
    if (!token) return;
    let cancelled = false;
    fetchBalance(token).then(async res => {
      if (cancelled) return;
      if (res.status === 401) return expireSession();
      if (res.ok) setBalance((await res.json()).balance);
    });
    return () => { cancelled = true; };
  }, [token]);

  const earn = async () => {
    if (!token) return false;
    const res = await earnPoints(token).catch(() => undefined);
    if (res?.status === 401) expireSession();
    if (!res?.ok) return false;
    setBalance((await res.json()).balance);
    return true;
  };

  return (
    <PointsContext.Provider value={{ balance, earn, setBalance }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) throw new Error('usePoints must be used within PointsProvider');
  return context;
};
