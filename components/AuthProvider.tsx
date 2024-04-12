import { createContext, useContext, useState, useMemo } from 'react';


interface AuthContextProps {
  email: string;
  setEmail: (email: string) => void;
  otp: string;
  setOTP: (otp: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
}

const AuthContext = createContext<AuthContextProps>({
  email: '',
  setEmail: () => {},
  otp: '',
  setOTP: () => {},
  phoneNumber: '',
  setPhoneNumber: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const authValue = useMemo(() => ({ email, setEmail, otp, setOTP, phoneNumber, setPhoneNumber   }), [email, setEmail, otp, setOTP, phoneNumber, setPhoneNumber]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};
