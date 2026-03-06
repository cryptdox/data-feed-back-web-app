import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Datasets } from './pages/Datasets';
import { CreateDataset } from './pages/CreateDataset';
import { UploadData } from './pages/UploadData';
import { Labeling } from './pages/Labeling';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
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
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
            {renderPage()}
          </MainLayout>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
