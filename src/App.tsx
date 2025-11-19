import { Navigate, Route, Routes } from 'react-router-dom';
import ClientLayout from './components/ClientLayout';
import DocumentTitle from './components/DocumentTitle';
import EnvironmentValidator from './components/EnvironmentValidator';
import ProtectedRoute from './components/ProtectedRoute';
import SessionInitializer from './components/SessionInitializer';
import InstallPrompt from './components/pwa/InstallPrompt';
import PushNotificationManager from './components/pwa/PushNotificationManager';
import ServiceWorkerRegistration from './components/pwa/ServiceWorkerRegistration';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/auth-context';

// Pages
import AiModePage from './pages/AiModePage';
import ApiKeysPage from './pages/ApiKeysPage';
import BasicEscrowPage from './pages/BasicEscrowPage';
import BitcoinExplorerSimplePage from './pages/BitcoinExplorerSimplePage';
import ContactUsPage from './pages/ContactUsPage';
import ContactsPage from './pages/ContactsPage';
import DashboardPage from './pages/DashboardPage';
import DocsPage from './pages/DocsPage';
import EscrowPage from './pages/EscrowPage';
import FaqPage from './pages/FaqPage';
import ForceInstallPage from './pages/ForceInstallPage';
import LoginPage from './pages/LoginPage';
import MilestoneEscrowPage from './pages/MilestoneEscrowPage';
import NotFoundPage from './pages/NotFoundPage';
import PaymentGatewayPage from './pages/PaymentGatewayPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import PublicPage from './pages/PublicPage';
import PwaTestPage from './pages/PwaTestPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import TransactionDetailsPage from './pages/TransactionDetailsPage';
import TransactionsPage from './pages/TransactionsPage';
import VouchersPage from './pages/VouchersPage';

function AppContent() {
  return (
    <>
      <SessionInitializer />
      <EnvironmentValidator>
        <PushNotificationManager>
          <ServiceWorkerRegistration />
          <DocumentTitle />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/public" element={<PublicPage />} />
            <Route path="/payment-gateway/*" element={<PaymentGatewayPage />} />
            <Route path="/bitcoin-explorer-simple" element={<BitcoinExplorerSimplePage />} />
            <Route path="/pwa-test" element={<PwaTestPage />} />
            <Route path="/force-install" element={<ForceInstallPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ClientLayout>
                    <DashboardPage />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/escrow"
              element={
                <ProtectedRoute>
                  <ClientLayout>
                    <EscrowPage />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/basic-escrow"
              element={
                <ProtectedRoute>
                  <ClientLayout>
                    <BasicEscrowPage />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/milestone-escrow"
              element={
                <ProtectedRoute>
                  <ClientLayout>
                    <MilestoneEscrowPage />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <ClientLayout>
                    <TransactionsPage />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions/:id"
              element={
                <ProtectedRoute>
                  <ClientLayout>
                    <TransactionDetailsPage />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/api-keys"
              element={
                <ProtectedRoute>
                  <ClientLayout>
                    <ApiKeysPage />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <ClientLayout>
                    <ContactsPage />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vouchers"
              element={
                <ProtectedRoute>
                  <ClientLayout>
                    <VouchersPage />
                  </ClientLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-mode"
              element={
                <ProtectedRoute>
                  <AiModePage />
                </ProtectedRoute>
              }
            />

            {/* Root redirect */}
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <InstallPrompt />
        </PushNotificationManager>
      </EnvironmentValidator>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

