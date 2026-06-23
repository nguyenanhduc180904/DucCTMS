import React from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspaces } from '../../hooks/useWorkspaces';

interface RequireRoleProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  forceAllow?: boolean;
}

const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children, fallback = null, forceAllow = false }) => {
    const { workspaceId } = useParams();
    const { data: workspaces } = useWorkspaces();
    
    if (forceAllow) return <>{children}</>;

    if (!workspaces || !workspaceId) return <>{fallback}</>;

    const activeWorkspace = workspaces.find(w => w.id === Number(workspaceId));

    if (activeWorkspace && allowedRoles.includes(activeWorkspace.role)) {
        return <>{children}</>;
    }
    
    return <>{fallback}</>;
};

export default RequireRole;
