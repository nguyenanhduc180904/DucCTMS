import React, { useState } from 'react';
import {
    Drawer, Typography, Space, Button, Dropdown, Avatar,
    Input, Divider, Tag, Row, Col, Skeleton, List, Tooltip
} from 'antd';
import {
    MoreOutlined, EditOutlined, DeleteOutlined,
    ClockCircleOutlined, UserOutlined, SendOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useTaskDetail } from '../../hooks/useTask';
import ManageTaskAssigneesModal from './ManageTaskAssigneesModal';

const { Title, Text } = Typography;
const { TextArea } = Input;
const BASE_URL = "http://localhost:8080";

interface TaskDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    taskId: number | null;
    workspaceId: string | undefined;
    projectId: string | undefined;
    onEditTask: () => void;
    onDeleteTask: () => void;
}

const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
    open, onClose, taskId, workspaceId, projectId, onEditTask, onDeleteTask
}) => {
    const [comment, setComment] = useState('');

    const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);

    const { data: task, isLoading, isError } = useTaskDetail(workspaceId, projectId, taskId);

    const taskMenu = {
        items: [
            {
                key: 'assignees',
                icon: <TeamOutlined style={{ color: '#52c41a' }} />,
                label: 'Quản lý thành viên',
                onClick: () => setIsAssigneeModalOpen(true), // Kích hoạt mở modal mới
            },
            {
                key: 'edit',
                icon: <EditOutlined style={{ color: '#1677ff' }} />,
                label: 'Sửa nhiệm vụ',
                onClick: onEditTask,
            },
            { type: 'divider' as const },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Xóa nhiệm vụ',
                danger: true,
                onClick: onDeleteTask,
            },
        ]
    };

    const getPriorityTag = (priority: string) => {
        if (!priority) return null;
        const colorMap: Record<string, string> = {
            HIGH: 'red',
            MEDIUM: 'orange',
            LOW: 'blue'
        };
        return <Tag color={colorMap[priority] || 'default'}>{priority}</Tag>;
    };

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>{task?.column_name || 'Nhiệm vụ'}</Text>
                    <Text style={{ fontSize: 14 }}>/</Text>
                    <Text strong style={{ fontSize: 16 }}>Chi tiết nhiệm vụ</Text>
                </div>
            }
            width={600}
            onClose={onClose}
            open={open}
            destroyOnClose
            extra={
                <Dropdown menu={taskMenu} trigger={['click']} placement="bottomRight">
                    <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
                </Dropdown>
            }
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
            ) : isError || !task ? (
                <Text type="danger">Không thể tải chi tiết nhiệm vụ.</Text>
            ) : (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* 1. TIÊU ĐỀ */}
                    <div>
                        <Title level={3} style={{ margin: 0, lineHeight: 1.3 }}>{task.title}</Title>
                    </div>

                    {/* 2. CÁC THUỘC TÍNH (META INFO) */}
                    <div style={{ background: '#f5f7f9', padding: 16, borderRadius: 8 }}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Người thực hiện</Text>
                                <Avatar.Group
                                    maxCount={4}
                                    maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer' }}
                                    maxPopoverTrigger="hover"
                                    maxPopoverPlacement="top"
                                >
                                    {task.assignees && task.assignees.length > 0 ? (
                                        task.assignees.map(user => {
                                            const avatarSrc = user.avatar_url?.startsWith('http')
                                                ? user.avatar_url
                                                : user.avatar_url ? `${BASE_URL}${user.avatar_url}` : undefined;
                                            return (
                                                <Tooltip title={user.full_name} key={user.id}>
                                                    <Avatar src={avatarSrc} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                                                </Tooltip>
                                            );
                                        })
                                    ) : (
                                        <Text type="secondary" italic>Chưa phân công</Text>
                                    )}
                                </Avatar.Group>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Nhãn (Labels)</Text>
                                {task.labels && task.labels.length > 0 ? (
                                    task.labels.map(l => (
                                        <Tag key={l.id} color={l.color} style={{ marginRight: 4 }}>{l.name}</Tag>
                                    ))
                                ) : (
                                    <Text type="secondary" italic>Chưa có nhãn</Text>
                                )}
                            </Col>
                            <Col span={12}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Độ ưu tiên</Text>
                                {getPriorityTag(task.priority)}
                            </Col>
                            <Col span={12}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Hạn chót</Text>
                                <Space>
                                    <ClockCircleOutlined style={{ color: task.due_date ? '#faad14' : '#bfbfbf' }} />
                                    <Text>{task.due_date ? task.due_date : 'Không có'}</Text>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    {/* 3. MÔ TẢ */}
                    <div>
                        <Text strong style={{ fontSize: 16 }}>Mô tả chi tiết</Text>
                        {task.description ? (
                            <div style={{ marginTop: 8, padding: 12, background: '#fafafa', borderRadius: 6, minHeight: 80 }}>
                                <Text>{task.description}</Text>
                            </div>
                        ) : (
                            <div style={{ marginTop: 8 }}>
                                <TextArea placeholder="Thêm mô tả chi tiết cho nhiệm vụ này..." rows={3} />
                                <Button type="primary" style={{ marginTop: 8 }}>Lưu mô tả</Button>
                            </div>
                        )}
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    {/* 4. BÌNH LUẬN & HOẠT ĐỘNG */}
                    <div>
                        <Text strong style={{ fontSize: 16 }}>Bình luận & Hoạt động</Text>

                        {/* Ô nhập bình luận */}
                        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                            <div style={{ flex: 1 }}>
                                <TextArea
                                    placeholder="Đặt câu hỏi hoặc thêm bình luận..."
                                    rows={2}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <div style={{ marginTop: 8, textAlign: 'right' }}>
                                    <Button type="primary" icon={<SendOutlined />} disabled={!comment.trim()}>
                                        Gửi bình luận
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Danh sách bình luận */}
                        <List
                            style={{ marginTop: 24 }}
                            itemLayout="horizontal"
                            dataSource={task.comments || []}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<UserOutlined />} />}
                                        title={
                                            <Space>
                                                <Text strong>{item.user}</Text>
                                                {/* Hiển thị thời gian ngắn gọn nếu cần format */}
                                                <Text type="secondary" style={{ fontSize: 12 }}>{item.created_at}</Text>
                                            </Space>
                                        }
                                        description={<Text style={{ color: '#333' }}>{item.content}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                </Space>
            )
            }

            <ManageTaskAssigneesModal
                open={isAssigneeModalOpen}
                onCancel={() => setIsAssigneeModalOpen(false)}
                taskId={taskId}
                workspaceId={workspaceId}
                projectId={projectId}
                currentAssignees={task?.assignees || []} // Truyền dữ liệu assignees hiện có xuống modal
            />
        </Drawer >
    );
};

export default TaskDetailDrawer;