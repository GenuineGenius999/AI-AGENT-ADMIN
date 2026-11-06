import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import ProfilePage from './pages/ProfilePage';
import KeysPage from './pages/KeysPage';
import PlaygroundPage from './pages/PlaygroundPage';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="boot-screen">
        <div className="boot-pulse" />
        <p>Loading Bot Service…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardLayout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/keys" replace />} />
        <Route path="keys" element={<KeysPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="playground" element={<PlaygroundPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
