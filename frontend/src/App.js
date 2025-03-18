import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DiagnosisForm from './pages/DiagnosisForm';
import MedicineSearch from './pages/MedicineSearch';
import MedicineDetails from './pages/MedicineDetails';
import Profile from './pages/Profile';
import BlockchainVerification from './pages/BlockchainVerification';

// Auth Protection
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box 
        height="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="brand.50"
      >
        Loading...
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1" py={8} px={4}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/diagnosis" element={
            <ProtectedRoute>
              <DiagnosisForm />
            </ProtectedRoute>
          } />
          
          <Route path="/medicines" element={
            <ProtectedRoute>
              <MedicineSearch />
            </ProtectedRoute>
          } />
          
          <Route path="/medicines/:id" element={
            <ProtectedRoute>
              <MedicineDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/blockchain" element={
            <ProtectedRoute>
              <BlockchainVerification />
            </ProtectedRoute>
          } />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
