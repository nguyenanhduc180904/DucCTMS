import { Result, Button } from 'antd';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../../hooks/useAuth';
import { useState } from 'react';
import CreateWorkspaceModal from './CreateWorkspaceModal';

const NoWorkspace = () => {
    const navigate = useNavigate();
    const { logout } = useLogout();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateSuccess = (newWorkspace: any) => {
        setIsModalOpen(false);
        navigate(`/workspace/${newWorkspace.id}/dashboard`);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
        }}>
            <Result
                status="info"
                title="Chào mừng bạn!"
                subTitle="Hiện tại bạn chưa tham gia không gian làm việc nào. Hãy tạo mới hoặc chờ lời mời."
                extra={[
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        key="create"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tạo Workspace mới
                    </Button>,
                    <Button
                        key="logout"
                        icon={<LogoutOutlined />}
                        onClick={logout}
                    >
                        Đăng xuất
                    </Button>
                ]}
            />

            {/* GỌI MODAL TẠI ĐÂY */}
            <CreateWorkspaceModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default NoWorkspace;