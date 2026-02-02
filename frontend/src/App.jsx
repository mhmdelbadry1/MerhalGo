import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Toast from './components/shared/Toast';
import NotFound from './components/shared/NotFound';

// Landing
import LandingPage from './components/Landing/LandingPage';

// Auth Pages
import VerifyEmail from './components/Auth/VerifyEmail';
import ResetPasswordPage from './components/Auth/ResetPasswordPage';

// Customer Pages
import CustomerDashboard from './components/customer/CustomerDashboard';
import CustomerOrders from './components/customer/CustomerOrders';
import CustomerSettings from './components/customer/CustomerSettings';

// Company Pages
import CompanyDashboard from './components/company/CompanyDashboard';
import CompanyOffers from './components/company/CompanyOffers';
import AllOrders from './components/company/AllOrders';
import CompanySettings from './components/company/CompanySettings';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import CompanyRequests from './components/admin/CompanyRequests';
import AdminSettings from './components/admin/AdminSettings';
import AdminOrders from './components/admin/AdminOrders';
import AdminCompanies from './components/admin/AdminCompanies';

// Forms
import CompanyRegisterForm from './components/forms/CompanyRegisterForm';
import InternationalShippingForm from './components/forms/InternationalShippingForm';
import LocalShippingForm from './components/forms/LocalShippingForm';
import ChineseStoresForm from './components/forms/ChineseStoresForm';
import SheinShippingForm from './components/forms/SheinShippingForm';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Toast />
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Admin Login - Secret URL */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Company Registration */}
            <Route path="/company-register" element={<CompanyRegisterForm />} />

            {/* Email Verification */}
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Password Reset */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />

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

            {/* Admin Routes - Nested under Layout */}
            <Route path="/admin" element={
              <ProtectedRoute allowedUserTypes={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="company-requests" element={<CompanyRequests />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>


            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
