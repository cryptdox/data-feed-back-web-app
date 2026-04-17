import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Datasets } from './pages/Datasets';
import { CreateDataset } from './pages/CreateDataset';
import { UploadData } from './pages/UploadData';
import { Labeling } from './pages/Labeling';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Loading } from './components/Loading';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { useInactivityLogout } from './contexts/InactivityLogout';
import { PublicLayout } from './layouts/PublicLayout';


function AppContent() {
  useInactivityLogout();
  const [currentPage, setCurrentPage] = useState('home');
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading message="Loading..." />;
  }

  const renderPublicPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      default:
        return <Login />;
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'datasets':
        return <Datasets onNavigate={setCurrentPage} />;
      case 'create-dataset':
        return <CreateDataset />;
      case 'upload':
        return <UploadData />;
      case 'labeling':
        return <Labeling />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      default:
        return <Analytics />;
    }
  };


  if (!isAuthenticated) {
    return (
      <PublicLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPublicPage()}
      </PublicLayout>
    );
  }

  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
