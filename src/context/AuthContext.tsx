import { createContext, useState, useEffect, } from 'react';
import type { ReactNode, } from 'react';

interface User {
  email: string;
  // Add other user properties as needed
}


interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;  // Add this
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, gender: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,  // Add this
  isLoggedIn: false,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  isLoading: false,
  error: null,
});

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);  // Add this
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate checking for a token on mount
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      // In a real app, you'd verify this token with your backend
      setIsLoggedIn(true);
      setUser(JSON.parse(userStr));
    }
    setIsLoading(false);
  }, []);

  // const login = async (email: string, password: string): Promise<boolean> => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     // Simulate API call to backend for login
  //     // Replace with actual fetch to your backend:
  //     // const response = await fetch('/api/login', {
  //     //   method: 'POST',
  //     //   headers: { 'Content-Type': 'application/json' },
  //     //   body: JSON.stringify({ email, password }),
  //     // });
  //     // const data = await response.json();
  //     // if (response.ok && data.token) {
  //     //   localStorage.setItem('authToken', data.token);
  //     //   setIsLoggedIn(true);
  //     //   return true;
  //     // } else {
  //     //   setError(data.message || 'Login failed');
  //     //   return false;
  //     // }

  //     // Mock successful login
  //     if (email === 'test@example.com' && password === 'password123') {
  //       const userData = { email }; // Add more user data as needed
  //       localStorage.setItem('authToken', 'mock_jwt_token_for_test_user');
  //       localStorage.setItem('user', JSON.stringify(userData));
  //       setUser(userData);
  //       setIsLoggedIn(true);
  //       console.log("Login successful");
  //       return true;
  //     } else {
  //       setError('Invalid email or password. Use test@example.com / password123');
  //       return false;
  //     }
  //   } catch (err) {
  //     setError('Network error or server issue during login.');
  //     console.log("Login error : \n" , err);
  //     return false;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', { // Ensure correct server URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        // Assuming your server might also return user info on login
        // if (data.user) {
        //   localStorage.setItem('user', JSON.stringify(data.user));
        //   setUser(data.user);
        // } else {
          // If not, just set the email for now
          localStorage.setItem('user', JSON.stringify({ email }));
          setUser({ email });
        // }
        setIsLoggedIn(true);
        return true;
      } else {
        setError(data.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('Network error or server issue during login.');
      console.error("Login error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  // const signup = async (email: string, password: string): Promise<boolean> => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     // Simulate API call to backend for signup
  //     // Replace with actual fetch to your backend:
  //     // const response = await fetch('/api/signup', {
  //     //   method: 'POST',
  //     //   headers: { 'Content-Type': 'application/json' },
  //     //   body: JSON.stringify({ email, password }),
  //     // });
  //     // const data = await response.json();
  //     // if (response.ok && data.token) {
  //     //   localStorage.setItem('authToken', data.token);
  //     //   setIsLoggedIn(true); // Auto-login after signup
  //     //   return true;
  //     // } else {
  //     //   setError(data.message || 'Signup failed');
  //     //   return false;
  //     // }

  //     // Mock successful signup (for demonstration, we'll just auto-login)
  //     if (email && password) {
  //       const userData = { email }; // Add more user data as needed
  //       localStorage.setItem('authToken', `mock_jwt_token_for_${email}`);
  //       localStorage.setItem('user', JSON.stringify(userData));
  //       setUser(userData);
  //       setIsLoggedIn(true);
  //       return true;
  //     } else {
  //       setError('Email and password are required for signup.');
  //       return false;
  //     }
  //   } catch (err) {
  //     setError('Network error or server issue during signup.');
  //     console.log("Signup error : \n" , err);
  //     return false;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const signup = async (email: string, password: string, name: string, gender: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', { // Ensure correct server URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, gender }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        // Assuming your server also returns user info upon signup
        // if (data.user) {
        //   localStorage.setItem('user', JSON.stringify(data.user));
        //   setUser(data.user);
        // } else {
          // If not, just set the email for now
          localStorage.setItem('user', JSON.stringify({ email }));
          setUser({ email });
        // }
        setIsLoggedIn(true); // Auto-login after signup
        return true;
      } else {
        setError(data.message || 'Signup failed');
        return false;
      }
    } catch (err) {
      setError('Network error or server issue during signup.');
      console.error("Signup error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, signup, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};