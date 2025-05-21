// // import React from 'react';s
// import KanbanBoardApp from './components/kanban/KanbanBoardApp';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { useContext, useState } from 'react';
// import { AuthContext, AuthProvider } from './context/AuthContext';
// import LoginPage from './pages/login';
// import SignupPage from './pages/signup';

// // function App() {
// //   return (
// //     // <KanbanBoardApp />
// //     <LoginPage />
// //   );
// // }





// // function App() {
// //   const { isLoggedIn, isLoading } = useContext(AuthContext);
// //   const [currentPath, setCurrentPath] = useState(window.location.hash);

// //   useEffect(() => {
// //     const handleHashChange = () => {
// //       setCurrentPath(window.location.hash);
// //     };
// //     window.addEventListener('hashchange', handleHashChange);
// //     return () => window.removeEventListener('hashchange', handleHashChange);
// //   }, []);

// //   if (isLoading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
// //         Loading authentication status...
// //       </div>
// //     );
// //   }

// //   if (isLoggedIn) {
// //     return <KanbanBoardApp />;
// //   } else {
// //     if (currentPath === '#signup') {
// //       return <SignupPage />;
// //     }
// //     return <LoginPage />;
// //   }
// // }



// function App() {
//   const { isLoggedIn, isLoading } = useContext(AuthContext);
//   // const [currentPath, setCurrentPath] = useState(window.location.hash);

//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           <Route path="/" element={<LoginPage />}  />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/home" element={<KanbanBoardApp />}  />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;







import { Navigate } from 'react-router-dom';
import KanbanBoardApp from './components/kanban/KanbanBoardApp';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';

// Create a Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <KanbanBoardApp />
              </ProtectedRoute>
            }
          />
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;




// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
