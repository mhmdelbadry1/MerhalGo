import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Shared/ProtectedRoute';

// Landing
import LandingPage from './components/Landing/LandingPage';

// Customer Pages
import CustomerDashboard from './components/Customer/CustomerDashboard';
import CustomerOrders from './components/Customer/CustomerOrders';
import CustomerSettings from './components/Customer/CustomerSettings';

// Company Pages
import CompanyDashboard from './components/Company/CompanyDashboard';
import CompanyOffers from './components/Company/CompanyOffers';
import AllOrders from './components/Company/AllOrders';
import CompanySettings from './components/Company/CompanySettings';

// Admin Pages
import AdminDashboard from './components/Admin/AdminDashboard';
import CompanyRequests from './components/Admin/CompanyRequests';
import AdminSettings from './components/Admin/AdminSettings';

// Forms
import CompanyRegisterForm from './components/Forms/CompanyRegisterForm';
import InternationalShippingForm from './components/Forms/InternationalShippingForm';
import LocalShippingForm from './components/Forms/LocalShippingForm';
import ChineseStoresForm from './components/Forms/ChineseStoresForm';
import SheinShippingForm from './components/Forms/SheinShippingForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Company Registration */}
          <Route path="/company-register" element={<CompanyRegisterForm />} />

          {/* Customer Routes */}
          <Route path="/customer" element={
            <ProtectedRoute allowedUserTypes={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customer/orders" element={
            <ProtectedRoute allowedUserTypes={['customer']}>
              <CustomerOrders />
            </ProtectedRoute>
          } />
          <Route path="/customer/settings" element={
            <ProtectedRoute allowedUserTypes={['customer']}>
              <CustomerSettings />
            </ProtectedRoute>
          } />

          {/* Customer Shipping Forms */}
          <Route path="/customer/shipping/international" element={
            <ProtectedRoute allowedUserTypes={['customer']}>
              <InternationalShippingForm />
            </ProtectedRoute>
          } />
          <Route path="/customer/shipping/local" element={
            <ProtectedRoute allowedUserTypes={['customer']}>
              <LocalShippingForm />
            </ProtectedRoute>
          } />
          <Route path="/customer/shipping/chinese" element={
            <ProtectedRoute allowedUserTypes={['customer']}>
              <ChineseStoresForm />
            </ProtectedRoute>
          } />
          <Route path="/customer/shipping/shein" element={
            <ProtectedRoute allowedUserTypes={['customer']}>
              <SheinShippingForm />
            </ProtectedRoute>
          } />

          {/* Company Routes */}
          <Route path="/company" element={
            <ProtectedRoute allowedUserTypes={['company']}>
              <CompanyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/company/offers" element={
            <ProtectedRoute allowedUserTypes={['company']}>
              <CompanyOffers />
            </ProtectedRoute>
          } />
          <Route path="/company/all-orders" element={
            <ProtectedRoute allowedUserTypes={['company']}>
              <AllOrders />
            </ProtectedRoute>
          } />
          <Route path="/company/settings" element={
            <ProtectedRoute allowedUserTypes={['company']}>
              <CompanySettings />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedUserTypes={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/company-requests" element={
            <ProtectedRoute allowedUserTypes={['admin']}>
              <CompanyRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedUserTypes={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
