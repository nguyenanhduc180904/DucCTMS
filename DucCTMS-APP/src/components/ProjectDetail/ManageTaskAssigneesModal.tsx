import React, { useState } from 'react';
import { Modal, Table, Input, Avatar, Space, Typography, Button, Tooltip, Skeleton } from 'antd';
import { SearchOutlined, UserAddOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useProjectMembers } from '../../hooks/useProjectMember';
import { useAddAssignee, useRemoveAssignee } from '../../hooks/useTask';

const { Text } = Typography;
const BASE_URL = "http://localhost:8080";

interface ManageTaskAssigneesModalProps {
    open: boolean;
    onCancel: () => void;
    taskId: number | null;
    workspaceId: string | undefined;
    projectId: string | undefined;
    currentAssignees: any[]; // Mảng assignees hiện tại lấy từ TaskDetailDrawer
}

const ManageTaskAssigneesModal: React.FC<ManageTaskAssigneesModalProps> = ({
    open, onCancel, taskId, workspaceId, projectId, currentAssignees
}) => {
    const [searchText, setSearchText] = useState('');

    // 1. Lấy toàn bộ thành viên đang có trong Dự án này
    const { data: projectMembers = [], isLoading } = useProjectMembers(workspaceId, projectId);

    // 2. Các hook API xử lý thêm/xóa assignee
    const { mutate: addAssignee, isPending: isAdding } = useAddAssignee(workspaceId, projectId, taskId);
    const { mutate: removeAssignee, isPending: isRemoving } = useRemoveAssignee(workspaceId, projectId, taskId);

    // Lọc danh sách thành viên theo ô tìm kiếm
    const filteredMembers = projectMembers.filter(member =>
        member.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.email.toLowerCase().includes(searchText.toLowerCase())
    );

    // Kiểm tra xem một User Id cụ thể có đang làm task này không
    const isAssigned = (userId: number) => {
        return currentAssignees?.some(assignee => assignee.id === userId);
    };

    const columns = [
        {
            title: 'Thành viên dự án',
            key: 'member',
            render: (_: any, record: any) => {
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
            title: 'Trạng thái / Thao tác',
            key: 'action',
            align: 'right' as const,
            render: (_: any, record: any) => {
                const assigned = isAssigned(record.userId);

                if (assigned) {
                    return (
                        <Tooltip title="Gỡ khỏi công việc">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                loading={isRemoving}
                                onClick={() => removeAssignee(record.userId)}
                            />
                        </Tooltip>
                    );
                }

                return (
                    <Button
                        type="dashed"
                        size="small"
                        icon={<UserAddOutlined />}
                        loading={isAdding}
                        onClick={() => addAssignee(record.userId)}
                    >
                        Giao việc
                    </Button>
                );
            },
        },
    ];

    return (
        <Modal
            title="Quản lý người thực hiện nhiệm vụ"
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            zIndex={1150} // zIndex cao hơn cả Drawer và EditTaskModal để hiển thị trên cùng
        >
            <div style={{ marginBottom: 16, marginTop: 16 }}>
                <Input
                    placeholder="Tìm kiếm thành viên dự án..."
                    prefix={<SearchOutlined />}
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {isLoading ? (
                <Skeleton active />
            ) : (
                <Table
                    columns={columns}
                    dataSource={filteredMembers}
                    rowKey="userId"
                    pagination={{ pageSize: 5 }}
                    size="small"
                />
            )}
        </Modal>
    );
};

export default ManageTaskAssigneesModal;