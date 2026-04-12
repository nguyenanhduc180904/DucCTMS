
import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './components/Auth/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import Register from './components/Auth/Register';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>

          <Route path="workspace/:workspaceId" element={<MainLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<div>Trang Boards/Projects</div>} />
            <Route path="members" element={<div>Trang quản lý thành viên</div>} />
            <Route path="userProfile" element={<UserProfile />} />
          </Route>

          {/* chú ý sau này phải gọi backend vào số 1 này */}
          <Route path="/" element={<Navigate to="/workspace/1/dashboard" replace />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;