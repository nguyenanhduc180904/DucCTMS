import React, { useState } from 'react';
import { Table, Space, Input, Avatar, Card, Typography, Skeleton, Button, message, Col, Row, Select, Modal, Tooltip, Tag } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, ExclamationCircleOutlined, SearchOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAddProjectMember, useProjectMembers, useRemoveProjectMember, useUpdateProjectRole, type ProjectMember } from '../../hooks/useProjectMember';
import { useMembers } from '../../hooks/useWorkspaceMember';
import RequireRole from '../Role/RequireRole';
import { useMyProfile } from '../../hooks/useUser';

const { Title, Text } = Typography;
const { Option } = Select;
const BASE_URL = "http://localhost:8080";

const projectRoleTranslations: Record<string, string> = {
    'MANAGER': 'Quản lý',
    'MEMBER': 'Thành viên'
};

const ProjectMembersPage: React.FC = () => {
    const navigate = useNavigate();
    const { workspaceId, projectId } = useParams();
    const { data: userData } = useMyProfile();

    const { data: members, isLoading, isError } = useProjectMembers(workspaceId, projectId);
    const { data: workspaceMembers } = useMembers(workspaceId);
    
    const { mutate: addMember, isPending: isAdding } = useAddProjectMember(workspaceId, projectId);
    const { mutate: updateRole, isPending: isUpdating } = useUpdateProjectRole(workspaceId, projectId);
    const { mutate: removeMember } = useRemoveProjectMember(workspaceId, projectId);

    const [searchText, setSearchText] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');

    const myWorkspaceRole = workspaceMembers?.find(m => m.userId === userData?.id)?.role;
    const isProjectManager = members?.find(m => m.userId === userData?.id)?.role === 'MANAGER';

    const filteredMembers = members?.filter(member =>
        member.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.email.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleAddMember = () => {
        if (!inviteEmail) return message.warning('Vui lòng nhập email');
        addMember({ email: inviteEmail, role: inviteRole }, {
            onSuccess: () => setInviteEmail('')
        });
    };

    const showDeleteConfirm = (record: ProjectMember) => {
        Modal.confirm({
            title: 'Xác nhận gỡ thành viên',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn gỡ ${record.fullName} khỏi dự án này?`,
            okText: 'Gỡ bỏ',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                removeMember(record.userId);
            },
        });
    };

    const columns = [
        {
            title: 'Thành viên',
            key: 'member',
            render: (_: any, record: ProjectMember) => {
                const avatarSrc = record.avatarUrl?.startsWith('http')
                    ? record.avatarUrl
                    : record.avatarUrl ? `${BASE_URL}${record.avatarUrl}` : undefined;

                return (
                    <Space>
                        <Avatar src={avatarSrc} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text strong>{record.fullName}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Vai trò dự án',
            key: 'role',
            render: (_: any, record: ProjectMember) => {
                const isMyself = record.userId === userData?.id;
                const targetWorkspaceRole = workspaceMembers?.find(wm => wm.userId === record.userId)?.role;

                let canModifyTarget = false;
                if (myWorkspaceRole === 'OWNER') canModifyTarget = true;
                else if (myWorkspaceRole === 'ADMIN') canModifyTarget = targetWorkspaceRole !== 'OWNER';
                else if (isProjectManager) canModifyTarget = targetWorkspaceRole !== 'OWNER' && targetWorkspaceRole !== 'ADMIN';

                const displayTag = () => {
                    let color = 'blue';
                    if (record.role === 'MANAGER') color = 'magenta';
                    return <Tag color={color}>{projectRoleTranslations[record.role] || record.role}</Tag>;
                };

                if (isMyself || !canModifyTarget) {
                    return displayTag();
                }

                return (
                    <Select
                        defaultValue={record.role}
                        size="small"
                        style={{ width: 120 }}
                        loading={isUpdating}
                        onChange={(newRole) => updateRole({ userId: record.userId, role: newRole })}
                    >
                        <Option value="MANAGER">Quản lý</Option>
                        <Option value="MEMBER">Thành viên</Option>
                    </Select>
                );
            },
        },
        {
            title: 'Ngày tham gia dự án',
            dataIndex: 'joinedAt',
            key: 'joinedAt',
            render: (date: string) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>,
        },

        {
            title: 'Thao tác',
            key: 'action',
            align: 'right' as const,
            render: (_: any, record: ProjectMember) => {
                const isSearchingMyself = record.userId === userData?.id;
                const targetWorkspaceRole = workspaceMembers?.find(wm => wm.userId === record.userId)?.role;

                let canModifyTarget = false;
                if (myWorkspaceRole === 'OWNER') canModifyTarget = true;
                else if (myWorkspaceRole === 'ADMIN') canModifyTarget = targetWorkspaceRole !== 'OWNER';
                else if (isProjectManager) canModifyTarget = targetWorkspaceRole !== 'OWNER' && targetWorkspaceRole !== 'ADMIN';

                return (
                    <Space size="middle">
                        {canModifyTarget && !isSearchingMyself ? (
                            <Tooltip title="Gỡ khỏi dự án">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => showDeleteConfirm(record)}
                                />
                            </Tooltip>
                        ) : (
                            <Text type="secondary" italic style={{ fontSize: '12px' }}>
                                {isSearchingMyself ? 'Bạn' : 'Không có quyền'}
                            </Text>
                        )}
                    </Space>
                );
            },
        },
    ];

    if (isError) return <Card>Có lỗi xảy ra khi tải danh sách thành viên dự án.</Card>;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Nút quay lại & Tiêu đề */}
            <div style={{ marginBottom: 24 }}>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/workspace/${workspaceId}/projects/${projectId}`)}
                    style={{ paddingLeft: 0, marginBottom: 8 }}
                >
                    Quay lại dự án
                </Button>
                <Title level={3} style={{ marginTop: 0 }}>Quản lý thành viên dự án</Title>
                <Text type="secondary">Thêm thành viên từ Workspace vào dự án này.</Text>
            </div>

            {/* PHẦN THÊM THÀNH VIÊN */}
            <RequireRole allowedRoles={['OWNER', 'ADMIN']} forceAllow={isProjectManager}>
                <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                    <Row gutter={16} align="middle">
                        <Col xs={24} md={12}>
                            <Input
                                placeholder="Nhập email thành viên (phải thuộc Workspace)..."
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onPressEnter={handleAddMember}
                            />
                        </Col>
                        <Col xs={14} md={6}>
                            <Select style={{ width: '100%' }} value={inviteRole} onChange={setInviteRole}>
                                <Option value="MANAGER">Quản lý</Option>
                                <Option value="MEMBER">Thành viên</Option>
                            </Select>
                        </Col>
                        <Col xs={10} md={6}>
                            <Button
                                type="primary"
                                icon={<UserAddOutlined />}
                                block
                                onClick={handleAddMember}
                                loading={isAdding}
                            >
                                Thêm vào dự án
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </RequireRole>

            {/* BẢNG DANH SÁCH */}
            <Card
                styles={{ body: { padding: 0 } }}
                style={{ borderRadius: 8, overflow: 'hidden' }}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                        <span>Thành viên hiện tại ({filteredMembers?.length || 0})</span>
                        <Input
                            placeholder="Tìm kiếm..."
                            prefix={<SearchOutlined />}
                            style={{ width: 250 }}
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                }
            >
                {isLoading ? (
                    <div style={{ padding: 24 }}><Skeleton active /></div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredMembers}
                        rowKey="userId"
                        pagination={{ pageSize: 10 }}
                    />
                )}
            </Card>
        </div>
    );
};

export default ProjectMembersPage;