import React, { useState } from 'react';
import {
    Drawer, Typography, Space, Button, Dropdown, Avatar,
    Input, Divider, Tag, Row, Col, Skeleton, List, Tooltip,
    Modal
} from 'antd';
import {
    MoreOutlined, EditOutlined, DeleteOutlined,
    ClockCircleOutlined, UserOutlined, SendOutlined,
    TeamOutlined,
    TagsOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useTaskDetail, useTaskLogs } from '../../hooks/useTask';
import ManageTaskAssigneesModal from './ManageTaskAssigneesModal';
import ManageTaskLabelsModal from './ManageTaskLabelsModal';
import { useAddComment, useDeleteComment } from '../../hooks/useComment';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { Tabs, Timeline } from 'antd';
import { HistoryOutlined, MessageOutlined } from '@ant-design/icons';

dayjs.extend(relativeTime);
dayjs.locale('vi');

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
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

    const { data: task, isLoading, isError } = useTaskDetail(workspaceId, projectId, taskId);
    const { mutate: addComment, isPending: isAddingComment } = useAddComment(workspaceId, projectId, taskId);
    const { mutate: deleteComment } = useDeleteComment(workspaceId, projectId, taskId);
    const { data: logs = [], isLoading: isLoadingLogs } = useTaskLogs(workspaceId, projectId, taskId);

    const renderLogMessage = (log: any) => {
        const details = log.details || {}; // Lấy cục JSON details ra

        switch (log.action) {
            case 'CREATE_TASK':
                return <>đã tạo nhiệm vụ này</>;
            case 'UPDATE_TASK':
                return <>đã cập nhật thông tin nhiệm vụ</>;

            case 'ADD_ASSIGNEE':
                return <>đã thêm <b>{details.user_name}</b> vào công việc</>;
            case 'REMOVE_ASSIGNEE':
                return <>đã gỡ <b>{details.user_name}</b> khỏi công việc</>;

            case 'ADD_LABEL':
                return <>đã gắn nhãn <Tag color={details.label_color} style={{ margin: 0 }}>{details.label_name}</Tag></>;
            case 'REMOVE_LABEL':
                return <>đã gỡ nhãn <Tag color={details.label_color} style={{ margin: 0 }}>{details.label_name}</Tag></>;

            case 'MOVE_TASK':
                return <>đã chuyển công việc từ cột <b>{details.from_column}</b> sang <b>{details.to_column}</b></>;

            case 'ADD_COMMENT':
                return <>đã thêm một bình luận mới</>;
            case 'DELETE_COMMENT':
                return <>đã xóa một bình luận</>;

            default:
                return <>đã thực hiện thao tác <Tag>{log.action}</Tag></>;
        }
    };

    const getTimelineColor = (action: string) => {
        if (action.startsWith('CREATE')) return 'green';
        if (action.startsWith('DELETE') || action.includes('REMOVE')) return 'red';
        return 'blue';
    };

    const handleCommentSubmit = () => {
        if (!comment.trim()) return;
        addComment(comment.trim(), {
            onSuccess: () => setComment('')
        });
    };

    const handleDeleteComment = (commentId: number) => {
        Modal.confirm({
            title: 'Xóa bình luận?',
            content: 'Bạn có chắc chắn muốn xóa bình luận này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                deleteComment(commentId);
            }
        });
    };

    const taskMenu = {
        items: [
            {
                key: 'assignees',
                icon: <TeamOutlined style={{ color: '#52c41a' }} />,
                label: 'Quản lý thành viên',
                onClick: () => setIsAssigneeModalOpen(true),
            },
            {
                key: 'labels',
                icon: <TagsOutlined style={{ color: '#fa8c16' }} />,
                label: 'Gắn nhãn nhiệm vụ',
                onClick: () => setIsLabelModalOpen(true),
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
                                {/* Tiêu đề và nút chỉnh sửa nhanh */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <Text type="secondary" style={{ display: 'block' }}>Nhãn (Labels)</Text>
                                    {task.labels && task.labels.length > 0 && (
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EditOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                                            onClick={() => setIsLabelModalOpen(true)}
                                            style={{ width: 20, height: 20, padding: 0 }}
                                        />
                                    )}
                                </div>

                                {/* Khu vực hiển thị danh sách Nhãn */}
                                {task.labels && task.labels.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 0' }}>
                                        {/* Hiển thị tối đa 3 nhãn đầu tiên */}
                                        {task.labels.slice(0, 3).map(l => (
                                            <Tag
                                                key={l.id}
                                                color={l.color}
                                                style={{ marginRight: 4, cursor: 'pointer' }}
                                                onClick={() => setIsLabelModalOpen(true)} // Bấm vào tag cũng mở Modal
                                            >
                                                {l.name}
                                            </Tag>
                                        ))}

                                        {/* Nếu lớn hơn 3 nhãn, gom thành thẻ +N */}
                                        {task.labels.length > 3 && (
                                            <Tooltip title={task.labels.slice(3).map(l => l.name).join(', ')}>
                                                <Tag
                                                    style={{ cursor: 'pointer', background: '#f5f5f5', borderStyle: 'dashed' }}
                                                    onClick={() => setIsLabelModalOpen(true)}
                                                >
                                                    +{task.labels.length - 3}
                                                </Tag>
                                            </Tooltip>
                                        )}
                                    </div>
                                ) : (
                                    <Button
                                        size="small"
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={() => setIsLabelModalOpen(true)}
                                    >
                                        Thêm nhãn
                                    </Button>
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
                                    <Text>{task.due_date ? dayjs(task.due_date).format('HH:mm - DD/MM/YYYY') : 'Không có'}</Text>
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
                                <TextArea disabled placeholder="Không có mô tả" rows={3} />
                            </div>
                        )}
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <Tabs
                        defaultActiveKey="comments"
                        items={[
                            {
                                key: 'comments',
                                label: <span><MessageOutlined /> Bình luận</span>,
                                children: (
                                    <div>
                                        {/* Ô nhập bình luận */}
                                        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                                            <div style={{ flex: 1 }}>
                                                <TextArea
                                                    placeholder="Đặt câu hỏi hoặc thêm bình luận..."
                                                    rows={2}
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    onPressEnter={(e) => {
                                                        if (!e.shiftKey) {
                                                            e.preventDefault();
                                                            handleCommentSubmit();
                                                        }
                                                    }}
                                                />
                                                <div style={{ marginTop: 8, textAlign: 'right' }}>
                                                    <Button
                                                        type="primary"
                                                        icon={<SendOutlined />}
                                                        disabled={!comment.trim()}
                                                        loading={isAddingComment}
                                                        onClick={handleCommentSubmit}
                                                    >
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
                                                <List.Item
                                                    actions={[
                                                        <Button
                                                            type="text"
                                                            danger
                                                            size="small"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDeleteComment(item.id)}
                                                        />
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={<Avatar icon={<UserOutlined />} />}
                                                        title={
                                                            <Space>
                                                                <Text strong>{item.user}</Text>
                                                                <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.created_at).fromNow()}</Text>
                                                            </Space>
                                                        }
                                                        description={
                                                            <div style={{ color: '#333', whiteSpace: 'pre-wrap', marginTop: 4 }}>
                                                                {item.content}
                                                            </div>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                )
                            },
                            // {/* Tab Lịch sử hoạt động thực tế */ }
                            {
                                key: 'history',
                                label: <span><HistoryOutlined /> Lịch sử hoạt động</span>,
                                children: (
                                    <div style={{ marginTop: 16, paddingLeft: 8 }}>
                                        {isLoadingLogs ? (
                                            <Skeleton active paragraph={{ rows: 3 }} />
                                        ) : logs.length === 0 ? (
                                            <Text type="secondary" italic>Chưa có lịch sử hoạt động nào.</Text>
                                        ) : (
                                            <Timeline
                                                items={logs.map(log => ({
                                                    color: getTimelineColor(log.action),
                                                    children: (
                                                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                                                            <div>
                                                                <Text strong>{log.actor_name}</Text> {renderLogMessage(log)}
                                                            </div>
                                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                                {dayjs(log.created_at).fromNow()} – {dayjs(log.created_at).format('HH:mm DD/MM/YYYY')}
                                                            </Text>
                                                        </Space>
                                                    )
                                                }))}
                                            />
                                        )}
                                    </div>
                                )
                            }
                        ]}
                    />

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

            <ManageTaskLabelsModal
                open={isLabelModalOpen}
                onCancel={() => setIsLabelModalOpen(false)}
                taskId={taskId}
                workspaceId={workspaceId}
                projectId={projectId}
                currentLabels={task?.labels || []}
            />
        </Drawer >
    );
};

export default TaskDetailDrawer;