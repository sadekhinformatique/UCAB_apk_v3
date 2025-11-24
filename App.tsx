
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Members from './pages/Members';
import AIReport from './pages/AIReport';
import Budget from './pages/Budget';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Community from './pages/Community';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStore();
  if (!user) return <>{children}</>;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen print:ml-0 print:p-0">
        <div className="max-w-7xl mx-auto print:max-w-none">
            {children}
        </div>
      </main>
    </div>
  );
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/transactions" element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            } />
             <Route path="/members" element={
              <PrivateRoute>
                <Members />
              </PrivateRoute>
            } />
             <Route path="/budget" element={
              <PrivateRoute>
                <Budget />
              </PrivateRoute>
            } />
             <Route path="/admin" element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/community" element={
              <PrivateRoute>
                <Community />
              </PrivateRoute>
            } />
            <Route path="/assistant" element={
              <PrivateRoute>
                <AIReport />
              </PrivateRoute>
            } />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <Layout>
            <AppRoutes />
        </Layout>
      </Router>
    </StoreProvider>
  );
};

export default App;
