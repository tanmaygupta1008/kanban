// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import React, { useContext, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { signup, isLoading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signup(email, password);
    if (success) {
        navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Sign Up</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
            Create an account to get started with your Kanban board.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full rounded-lg py-2 text-lg" disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a href="/" onClick={() => window.location.hash = '#login'} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Login
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupPage;


// // import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import React, { useContext, useState } from 'react';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
// import { AuthContext } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';

// const SignupPage = () => {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const { signup, isLoading, error } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('/api/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         // Assuming your API sends an 'error' field in the JSON response
//         throw new Error(errorData.error || 'Signup failed');
//       }

//       const data = await response.json();
//       console.log('Signup successful:', data);
//       // Assuming your AuthContext's signup function handles local state and token storage
//       const success = await signup(email, password);
//       if (success) {
//         navigate('/home');
//       }
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         console.error('Signup error:', err.message);
//         // Optionally update local error state if AuthContext doesn't handle this
//         // setError(err.message);
//       } else {
//         console.error('Signup error:', err);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl">
//         <CardHeader className="text-center">
//           <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Sign Up</CardTitle>
//           <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
//             Create an account to get started with your Kanban board.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid gap-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="m@example.com"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="rounded-lg"
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="rounded-lg"
//               />
//             </div>
//             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
//             <Button type="submit" className="w-full rounded-lg py-2 text-lg" disabled={isLoading}>
//               {isLoading ? 'Signing up...' : 'Sign Up'}
//             </Button>
//           </form>
//         </CardContent>
//         <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400">
//           Already have an account?{' '}
//           <a href="#login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
//             Login
//           </a>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// };

// export default SignupPage;