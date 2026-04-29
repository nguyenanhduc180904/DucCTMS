
import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './components/Auth/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import Register from './components/Auth/Register';
import UserProfile from './components/UserProfile';
import { useWorkspaces } from './hooks/useWorkspaces';
import NoWorkspace from './components/Workspace/NoWorkspace';
import MembersPage from './components/WorkspaceMember/MembersPage';
import ProjectsPage from './components/Project';
import ProjectDetail from './components/ProjectDetail';
import ProjectMembersPage from './components/ProjectMembers/ProjectMembersPage';

// Component phụ để điều hướng tự động
const RootRedirect = () => {
  const { data: workspaces, isLoading } = useWorkspaces();

  if (isLoading) return null;

  if (workspaces && workspaces.length > 0) {
    return <Navigate to={`/workspace/${workspaces[0].id}/dashboard`} replace />;
  }

  return <Navigate to="no-workspace" replace />;
};
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>

          <Route path="workspace/:workspaceId" element={<MainLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:projectId/members" element={<ProjectMembersPage />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="userProfile" element={<UserProfile />} />
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="no-workspace" element={<NoWorkspace />} />
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