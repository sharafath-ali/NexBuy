import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import LoadingSpinner from "./components/LoadingSpinner";

function App() {

  const HomePage = lazy(() => import('./pages/HomePage'));
  const LoginPage = lazy(() => import('./pages/LoginPage'));
  const SignupPage = lazy(() => import('./pages/SignupPage'));

  const { user, checkAuth, checkingAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (checkingAuth) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      < div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,85,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
        </div>
      </div>
      <div className='relative z-50 pt-20'>
        <Suspense fallback={<LoadingSpinner />}>
          <Navbar />
          <Routes>
            <Route path="/" element={<ProtectedRoute user={user} >  <HomePage /> </ProtectedRoute>} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          </Routes>
        </Suspense>
      </div>
      <Toaster />
    </div >
  );
}

export default App;
