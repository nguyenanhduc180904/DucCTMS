import React, { useState } from 'react';
import { Table, Tag, Space, Button, Input, Avatar, Card, Typography, Select, Row, Col, Tooltip, Modal, message, Skeleton } from 'antd';
import { UserAddOutlined, DeleteOutlined, SearchOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs'; // Cài đặt: npm install dayjs
import { useInviteMember, useMembers, useRemoveMember, useUpdateRole, type Member } from '../../hooks/useWorkspaceMember';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { useMyProfile } from '../../hooks/useUser';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const BASE_URL = "http://localhost:8080";

const MembersPage: React.FC = () => {
    const { workspaceId } = useParams();
    const { data: members, isLoading, isError } = useMembers(workspaceId);
    const { data: workspaces } = useWorkspaces();
    const { data: userData } = useMyProfile();

    const [searchText, setSearchText] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');
    const { mutate: updateRole, isPending: isUpdating } = useUpdateRole(workspaceId);

    const filteredMembers = members?.filter(member =>
        member.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.email.toLowerCase().includes(searchText.toLowerCase())
    );

    const activeWorkspace = workspaces?.find(w => w.id === Number(workspaceId));
    const myRole = activeWorkspace?.role;
    const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

    const { mutate: removeMember } = useRemoveMember(workspaceId);
    const showDeleteConfirm = (record: Member) => {
        confirm({
            title: 'Xác nhận gỡ thành viên',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn gỡ ${record.fullName} khỏi workspace này?`,
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
            render: (_: any, record: Member) => {
                const avatarSrc = record.avatarUrl?.startsWith('http')
                    ? record.avatarUrl
                    : record.avatarUrl ? `${BASE_URL}${record.avatarUrl}` : undefined;

                return (
                    <Space>
                        <Avatar src={avatarSrc} icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text strong>{record.fullName}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Vai trò',
            key: 'role',
            render: (_: any, record: Member) => {
                const isTargetOwner = record.role === 'OWNER';
                const isMyself = record.userId === userData?.id;

                if (isTargetOwner || isMyself || !canManage) {
                    let color = 'blue';
                    if (record.role === 'OWNER') color = 'gold';
                    if (record.role === 'ADMIN') color = 'magenta';
                    return <Tag color={color}>{record.role}</Tag>;
                }

                return (
                    <Select
                        defaultValue={record.role}
                        size="small"
                        style={{ width: 100 }}
                        loading={isUpdating}
                        onChange={(newRole) => updateRole({ userId: record.userId, role: newRole })}
                    >
                        <Option value="ADMIN">ADMIN</Option>
                        <Option value="MEMBER">MEMBER</Option>
                    </Select>
                );
            },
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'joinedAt',
            key: 'joinedAt',
            render: (date: string) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right' as const,
            render: (_: any, record: Member) => {

                const isTargetOwner = record.role === 'OWNER';
                const isSearchingMyself = record.userId === userData?.id;

                return (
                    <Space size="middle">
                        {canManage && !isTargetOwner && !isSearchingMyself ? (
                            <>
                                <Tooltip title="Gỡ khỏi workspace">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => showDeleteConfirm(record)}
                                    />
                                </Tooltip>
                            </>
                        ) : (
                            <Text type="secondary" italic style={{ fontSize: '12px' }}>
                                {isTargetOwner ? 'Chủ sở hữu' : isSearchingMyself ? 'Bạn' : 'Không có quyền'}
                            </Text>
                        )}
                    </Space>
                );
            },
        },
    ];

    if (isError) return <Card>Có lỗi xảy ra khi tải danh sách thành viên.</Card>;

    const { mutate: inviteMember, isPending: isInviting } = useInviteMember(workspaceId);

    const handleInvite = () => {
        if (!inviteEmail) {
            return message.warning('Vui lòng nhập email!');
        }

        inviteMember(
            { email: inviteEmail, role: inviteRole },
            {
                onSuccess: () => {
                    setInviteEmail('');
                }
            }
        );
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>Quản lý thành viên</Title>
                <Text type="secondary">Thêm thành viên mới và quản lý quyền hạn trong không gian làm việc này.</Text>
            </div>

            {canManage && (
                <Card style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Row gutter={16} align="middle">
                        <Col xs={24} md={12}>
                            <Input
                                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Nhập email thành viên muốn mời..."
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                disabled={isInviting}
                            />
                        </Col>
                        <Col xs={14} md={6}>
                            <Select
                                style={{ width: '100%' }}
                                value={inviteRole}
                                onChange={(value) => setInviteRole(value)}
                                disabled={isInviting}
                            >
                                <Option value="ADMIN">Quản trị viên (Admin)</Option>
                                <Option value="MEMBER">Thành viên (Member)</Option>
                            </Select>
                        </Col>
                        <Col xs={10} md={6}>
                            <Button
                                type="primary"
                                icon={<UserAddOutlined />}
                                block
                                onClick={handleInvite}
                                loading={isInviting}
                            >
                                Mời thành viên
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}



            {/* Bảng dữ liệu */}
            <Card
                styles={{ body: { padding: 0 } }}
                style={{ borderRadius: 8, overflow: 'hidden' }}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                        <span>Danh sách thành viên</span>
                        {/* 3. Ô Input tìm kiếm */}
                        <Input
                            placeholder="Tìm kiếm tên hoặc email..."
                            prefix={<SearchOutlined />}
                            style={{ width: 300 }}
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
                        loading={isLoading}
                        pagination={{ pageSize: 10 }}
                    />
                )}
            </Card>
        </div>
    );
};

export default MembersPage;