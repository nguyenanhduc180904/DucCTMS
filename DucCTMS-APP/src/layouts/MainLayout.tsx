import { useState } from 'react';
import { useNavigate, useLocation, Outlet, useParams, Navigate } from 'react-router-dom';
import {
    Layout,
    Menu,
    Button,
    Avatar,
    Badge,
    Dropdown,
    Space,
    Typography,
    theme,
    Divider,
    Modal,
} from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    ProjectOutlined,
    BellOutlined,
    UserOutlined,
    LogoutOutlined,
    TeamOutlined,
    PlusOutlined,
    SwapOutlined,
    CheckSquareOutlined,
    HistoryOutlined,
    SettingOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useLogout } from '../hooks/useAuth';
import { useDeleteWorkspace, useWorkspaces } from '../hooks/useWorkspaces';
import { useMyProfile } from '../hooks/useUser';
import WorkspaceModal from '../components/Workspace/WorkspaceModal';

const BASE_URL = "http://localhost:8080";
const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState<any>(null);

    const { logout } = useLogout();
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const { data: userData } = useMyProfile();
    const avatarSrc = userData?.avatarUrl?.startsWith('blob')
        ? userData.avatarUrl
        : userData?.avatarUrl
            ? `${BASE_URL}${userData.avatarUrl}`
            : undefined;
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const { data: workspaces = [], isLoading } = useWorkspaces();

    if (!isLoading && workspaces.length === 0) {
        return <Navigate to="/no-workspace" replace />;
    }
    const activeWorkspace = workspaces.find(w => w.id === Number(workspaceId)) || workspaces[0];

    const handleWorkspaceChange = (id: number) => {
        navigate(`/workspace/${id}/dashboard`);
    };

    const handleOpenCreate = () => {
        setEditingWorkspace(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (workspace: any) => {
        setEditingWorkspace(workspace);
        setIsModalOpen(true);
    };

    const { mutate: deleteWorkspace } = useDeleteWorkspace();

    const handleDeleteWorkspace = (workspace: any) => {
        Modal.confirm({
            title: 'Xác nhận xóa Workspace',
            content: `Bạn có chắc chắn muốn xóa "${workspace.name}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                deleteWorkspace(workspace.id, {
                    onSuccess: () => {
                        if (Number(workspaceId) === workspace.id) {
                            navigate('/');
                        }
                    }
                });
            },
        });
    };

    // Menu cho Dropdown Workspace
    const workspaceMenuItems = {
        items: [
            ...workspaces.map(w => ({
                key: w.id,
                label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{w.name}</span>
                        {w.role !== 'MEMBER' && (
                            <Space onClick={(e) => e.stopPropagation()}>
                                <EditOutlined
                                    style={{ color: '#1677ff', fontSize: '14px' }}
                                    onClick={() => handleOpenEdit(w)}
                                />
                                <DeleteOutlined
                                    style={{ color: '#ff4d4f', fontSize: '14px' }}
                                    onClick={() => handleDeleteWorkspace(w)}
                                />
                            </Space>
                        )}
                    </div>
                ),
                icon: <TeamOutlined />,
                onClick: () => handleWorkspaceChange(w.id),
                disabled: w.id === activeWorkspace?.id
            })),
            { type: 'divider' as const, key: 'divider' },
            {
                key: 'add',
                label: 'Tạo Workspace mới',
                icon: <PlusOutlined />,
                onClick: handleOpenCreate,
            },
        ]
    };

    const menuItems = [
        {
            key: `/workspace/${activeWorkspace?.id}/dashboard`,
            icon: <DashboardOutlined />,
            label: 'Tổng quan'
        },
        {
            key: `/workspace/${activeWorkspace?.id}/members`,
            icon: <TeamOutlined />,
            label: 'Thành viên'
        },
        {
            key: `/workspace/${activeWorkspace?.id}/my-tasks`,
            icon: <CheckSquareOutlined />,
            label: 'Việc của tôi'
        },
        {
            key: `/workspace/${activeWorkspace?.id}/projects`,
            icon: <ProjectOutlined />,
            label: 'Dự án (Boards)'
        },
        ...(activeWorkspace?.role !== 'MEMBER' ? [{
            key: `/workspace/${activeWorkspace?.id}/settings`,
            icon: <SettingOutlined />,
            label: 'Cài đặt hệ thống'
        }] : []),
        {
            key: `/workspace/${activeWorkspace?.id}/activities`,
            icon: <HistoryOutlined />,
            label: 'Nhật ký hoạt động'
        },
    ];

    const userActionItems = [
        { key: 'profile', label: 'Thông tin cá nhân', icon: <UserOutlined />, onClick: () => navigate(`/workspace/${activeWorkspace?.id}/userProfile`) },
        { type: 'divider' as const },
        { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: logout },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* SIDEBAR */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="light"
                width={260}
                style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)', zIndex: 10 }}
            >
                {/* Logo Area */}
                <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                    <div style={{
                        minWidth: 32, height: 32, background: '#1677ff', borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <ProjectOutlined style={{ color: '#fff', fontSize: 18 }} />
                    </div>
                    {!collapsed && (
                        <Text strong style={{ marginLeft: 12, fontSize: 16, color: '#1677ff', whiteSpace: 'nowrap' }}>
                            Duc-CTMS
                        </Text>
                    )}
                </div>

                {/* WORKSPACE SWITCHER */}
                <div style={{ padding: '0 12px 16px 12px' }}>
                    <Dropdown menu={workspaceMenuItems} trigger={['click']} placement="bottomLeft">
                        <Button
                            block
                            style={{
                                height: 'auto',
                                padding: collapsed ? '8px 0' : '8px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #d9d9d9'
                            }}
                        >
                            <Space size={collapsed ? 0 : 8}>
                                <Avatar
                                    size="small"
                                    shape="square"
                                    style={{ backgroundColor: '#87d068' }}
                                >
                                    {activeWorkspace?.name.charAt(0)}
                                </Avatar>
                                {!collapsed && (
                                    <div style={{ textAlign: 'left', overflow: 'hidden', width: 140 }}>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', lineHeight: 1 }}>Không gian</div>
                                        <Text strong ellipsis style={{ display: 'block' }}>
                                            {activeWorkspace?.name}
                                        </Text>
                                    </div>
                                )}
                                {!collapsed && <SwapOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                            </Space>
                        </Button>
                    </Dropdown>
                </div>

                <Divider style={{ margin: '0 0 12px 0' }} />

                {/* MENU HỆ THỐNG */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ borderRight: 0 }}
                />
            </Sider>

            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: colorBgContainer,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 40, height: 40 }}
                    />

                    <Space size="large">
                        <Badge count={3} size="small">
                            <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} />
                        </Badge>

                        <Dropdown menu={{ items: userActionItems }} placement="bottomRight">
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar src={avatarSrc} icon={<UserOutlined />} />
                                {!collapsed && (
                                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                        <Text strong>{userData?.username || userData?.fullName}</Text>
                                    </div>
                                )}
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: 280 }}>
                    <Outlet />
                </Content>
            </Layout>

            <WorkspaceModal
                open={isModalOpen}
                initialValues={editingWorkspace}
                onCancel={() => setIsModalOpen(false)}
            />
        </Layout>
    );
};

export default MainLayout;