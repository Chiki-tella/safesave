import { useState } from 'react';
import { Toaster } from 'sonner';
import { LoginScreen } from './components/LoginScreen';
import { SignUpForm } from './components/SignUpForm';
import { SignInForm } from './components/SignInForm';
import { AdminSignInForm } from './components/AdminSignInForm';
import { WalletConnectForm } from './components/WalletConnectForm';
import { Dashboard } from './components/Dashboard';
import { SavingsPage } from './components/SavingsPage';
import { LoanPage } from './components/LoanPage';
import { InvestmentsPage } from './components/InvestmentsPage';
import { RewardsPage } from './components/RewardsPage';
import { TransparencyPage } from './components/TransparencyPage';
import { BottomNav } from './components/BottomNav';
import { AdminLayout } from './components/AdminLayout';
import { AdminHome } from './components/AdminHome';
import { AdminSavings } from './components/AdminSavings';
import { AdminLoans } from './components/AdminLoans';
import { AdminInvestments } from './components/AdminInvestments';
import { AdminMembers } from './components/AdminMembers';
import { AdminAlerts } from './components/AdminAlerts';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showAdminSignIn, setShowAdminSignIn] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [fromSignUp, setFromSignUp] = useState(false);
  const [userType, setUserType] = useState<'member' | 'admin'>('member');
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [adminScreen, setAdminScreen] = useState<'home' | 'savings' | 'loans' | 'investments' | 'members' | 'alerts'>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = () => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('safe_save_current_user') || '{}');
    setCurrentUser(user);
    setUserType(user.accountType || 'member');
    setIsLoggedIn(true);
    setShowSignUp(false);
    setShowSignIn(false);
    setShowAdminSignIn(false);
    setShowWalletConnect(false);
    setFromSignUp(false);
  };

  const handleAdminLogin = () => {
    setCurrentUser(null);
    setUserType('admin');
    setIsLoggedIn(true);
    setShowSignUp(false);
    setShowSignIn(false);
    setShowAdminSignIn(false);
    setShowWalletConnect(false);
    setFromSignUp(false);
  };

  const handleShowWalletConnect = () => {
    setShowWalletConnect(true);
    setShowSignIn(false);
    setShowAdminSignIn(false);
    setShowSignUp(false);
    setFromSignUp(false);
    setUserType('member');
  };

  const handleShowSignIn = () => {
    // Show unified sign in form for members
    setShowSignIn(true);
    setShowAdminSignIn(false);
    setShowSignUp(false);
    setShowWalletConnect(false);
  };

  const handleShowAdminSignIn = () => {
    // Show admin sign in form
    setShowAdminSignIn(true);
    setShowSignIn(false);
    setShowSignUp(false);
    setShowWalletConnect(false);
  };

  const handleJoinGroup = () => {
    setShowSignUp(true);
    setShowSignIn(false);
    setShowAdminSignIn(false);
    setShowWalletConnect(false);
  };

  const handleSignUpComplete = (accountType: 'member' | 'admin', userData: any) => {
    setUserType(accountType);
    setCurrentUser(userData);
    setShowSignUp(false);
    setShowWalletConnect(true);
    setFromSignUp(true);
  };

  const handleBackToLogin = () => {
    setShowSignUp(false);
    setShowSignIn(false);
    setShowAdminSignIn(false);
    setShowWalletConnect(false);
    setFromSignUp(false);
  };

  const handleNavigate = (screen: string) => {
    setActiveScreen(screen);
  };

  if (!isLoggedIn) {
    if (showWalletConnect) {
      return (
        <WalletConnectForm
          onConnect={handleLogin}
          onBack={handleBackToLogin}
          fromSignUp={fromSignUp}
        />
      );
    }
    if (showAdminSignIn) {
      return <AdminSignInForm onSignIn={handleAdminLogin} onBack={handleBackToLogin} />;
    }
    if (showSignIn) {
      return <SignInForm onSignIn={handleLogin} onBack={handleBackToLogin} onWalletSignIn={handleShowWalletConnect} />;
    }
    if (showSignUp) {
      return <SignUpForm onSignUp={handleSignUpComplete} onBack={handleBackToLogin} />;
    }
    return (
      <LoginScreen
        onLogin={handleShowWalletConnect}
        onJoinGroup={handleJoinGroup}
        onSignIn={handleShowSignIn}
        onAdminSignIn={handleShowAdminSignIn}
      />
    );
  }

  // Admin view
  if (userType === 'admin') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">
            <AdminLayout
              activeScreen={adminScreen}
              onNavigate={setAdminScreen}
            >
              {adminScreen === 'home' && (
                <AdminHome onNavigate={setAdminScreen} />
              )}
              {adminScreen === 'savings' && <AdminSavings />}
              {adminScreen === 'loans' && <AdminLoans />}
              {adminScreen === 'investments' && <AdminInvestments />}
              {adminScreen === 'members' && <AdminMembers />}
              {adminScreen === 'alerts' && <AdminAlerts />}
            </AdminLayout>
          </div>
        </div>
      </>
    );
  }

  // Member view
  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-slate-50">
        {/* Mobile Container */}
        <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">
          {/* Render Active Screen */}
          {activeScreen === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {activeScreen === 'savings' && <SavingsPage />}
          {activeScreen === 'loans' && <LoanPage />}
          {activeScreen === 'investments' && <InvestmentsPage />}
          {activeScreen === 'rewards' && <RewardsPage />}
          {activeScreen === 'transparency' && <TransparencyPage />}

          {/* Bottom Navigation */}
          <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
        </div>
      </div>
    </>
  );
}