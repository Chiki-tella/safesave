// App.tsx
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

// ✅ Import userStorage functions
import { getCurrentUser, setCurrentUser } from './components/data/userStorage';

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
  const [currentUserState, setCurrentUserState] = useState<any>(null);

  // ✅ Main login handler
  const handleLogin = () => {
    const user = getCurrentUser(); // read from userStorage
    if (!user) return;

    setCurrentUserState(user);
    setUserType(user.accountType || 'member');
    setIsLoggedIn(true);
    setShowSignUp(false);
    setShowSignIn(false);
    setShowAdminSignIn(false);
    setShowWalletConnect(false);
    setFromSignUp(false);
  };

  // Admin login
  const handleAdminLogin = () => {
    setCurrentUserState(null);
    setUserType('admin');
    setIsLoggedIn(true);
    setShowSignUp(false);
    setShowSignIn(false);
    setShowAdminSignIn(false);
    setShowWalletConnect(false);
    setFromSignUp(false);
  };

  // Wallet Connect
  const handleWalletConnect = () => {
    // Example wallet user
    const walletUser = { email: 'wallet@example.com', accountType: 'member' };
    setCurrentUser(walletUser); // save in userStorage
    handleLogin(); // redirect automatically
  };

  // Show screens
  const handleShowSignIn = () => {
    setShowSignIn(true);
    setShowAdminSignIn(false);
    setShowSignUp(false);
    setShowWalletConnect(false);
  };

  const handleShowAdminSignIn = () => {
    setShowAdminSignIn(true);
    setShowSignIn(false);
    setShowSignUp(false);
    setShowWalletConnect(false);
  };

  const handleShowWalletConnectScreen = () => {
    setShowWalletConnect(true);
    setShowSignIn(false);
    setShowAdminSignIn(false);
    setShowSignUp(false);
    setFromSignUp(false);
    setUserType('member');
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

  // ✅ Render login/signup flows
  if (!isLoggedIn) {
    if (showWalletConnect) {
      return <WalletConnectForm onConnect={handleWalletConnect} onBack={handleBackToLogin} fromSignUp={fromSignUp} />;
    }
    if (showAdminSignIn) {
      return <AdminSignInForm onSignIn={handleAdminLogin} onBack={handleBackToLogin} />;
    }
    if (showSignIn) {
      return <SignInForm onSignIn={handleLogin} onBack={handleBackToLogin} onWalletSignIn={handleShowWalletConnectScreen} />;
    }
    if (showSignUp) {
      return <SignUpForm onSignUp={handleSignUpComplete} onBack={handleBackToLogin} />;
    }
    return (
      <LoginScreen
        onLogin={handleShowWalletConnectScreen}
        onJoinGroup={handleJoinGroup}
        onSignIn={handleShowSignIn}
        onAdminSignIn={handleShowAdminSignIn}
      />
    );
  }

  // ✅ Admin view
  if (userType === 'admin') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">
            <AdminLayout activeScreen={adminScreen} onNavigate={setAdminScreen}>
              {adminScreen === 'home' && <AdminHome onNavigate={setAdminScreen} />}
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

  // ✅ Member view
  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">
          {activeScreen === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {activeScreen === 'savings' && <SavingsPage />}
          {activeScreen === 'loans' && <LoanPage />}
          {activeScreen === 'investments' && <InvestmentsPage />}
          {activeScreen === 'rewards' && <RewardsPage />}
          {activeScreen === 'transparency' && <TransparencyPage />}
          <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
        </div>
      </div>
    </>
  );
}
