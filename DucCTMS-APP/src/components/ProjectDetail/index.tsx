import { useState } from 'react';
import {
    Layout, Breadcrumb, Button, Avatar,
    Tag, Card, Badge, Space, Typography,
    Input, Divider, Drawer
} from 'antd';
import {
    PlusOutlined,
    EllipsisOutlined,
    UserAddOutlined,
    ClockCircleOutlined,
    MessageOutlined,
    SearchOutlined,
    MoreOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// --- 1. ĐỊNH NGHĨA TYPES (GIẢI QUYẾT LỖI ANY/NEVER) ---
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

interface Label {
    id: number;
    name: string;
    color: string;
}

interface User {
    id: number;
    full_name: string;
    avatar_url: string;
}

interface Task {
    id: number;
    column_id: number;
    title: string;
    description?: string;
    priority: Priority;
    due_date?: string;
    labels: Label[];
    assignees: User[];
    comment_count: number;
}

interface Column {
    id: number;
    name: string;
    tasks: Task[];
}

// --- 2. DỮ LIỆU MẪU (MOCK DATA) ---
// Tìm đến vị trí này trong file và thay thế bằng nội dung bên dưới
const MOCK_COLUMNS: Column[] = [
    {
        id: 1,
        name: "Cần làm (Backlog)",
        tasks: [
            {
                id: 101, column_id: 1, title: "Nghiên cứu kiến trúc Microservices", priority: "HIGH",
                comment_count: 3, labels: [{ id: 1, name: "Research", color: "purple" }],
                assignees: [{ id: 1, full_name: "Duc", avatar_url: "https://i.pravatar.cc/150?u=1" }]
            },
            {
                id: 102, column_id: 1, title: "Thiết kế Landing Page", priority: "MEDIUM",
                comment_count: 0, labels: [{ id: 2, name: "Design", color: "magenta" }],
                due_date: "2026-05-15", assignees: []
            },
            {
                id: 103, column_id: 1, title: "Viết tài liệu hướng dẫn API", priority: "LOW",
                comment_count: 1, labels: [{ id: 3, name: "Docs", color: "cyan" }],
                assignees: []
            },
        ]
    },
    {
        id: 2,
        name: "Đang thực hiện",
        tasks: [
            {
                id: 201, column_id: 2, title: "Cài đặt Ant Design & Tailwind", priority: "HIGH",
                comment_count: 12, labels: [{ id: 4, name: "Frontend", color: "blue" }],
                due_date: "2026-04-30", assignees: [{ id: 2, full_name: "An", avatar_url: "https://i.pravatar.cc/150?u=2" }]
            },
            {
                id: 202, column_id: 2, title: "Sửa lỗi bảo mật Login", priority: "HIGH",
                comment_count: 8, labels: [{ id: 5, name: "Security", color: "red" }],
                assignees: [{ id: 1, full_name: "Duc", avatar_url: "https://i.pravatar.cc/150?u=1" }]
            }
        ]
    },
    {
        id: 3,
        name: "Kiểm thử (QA)",
        tasks: [
            {
                id: 301, column_id: 3, title: "Unit test Module thanh toán", priority: "MEDIUM",
                comment_count: 2, labels: [{ id: 6, name: "Testing", color: "orange" }],
                due_date: "2026-05-05", assignees: []
            }
        ]
    },
    {
        id: 4,
        name: "Hoàn thành",
        tasks: [
            {
                id: 401, column_id: 4, title: "Khởi tạo Database Schema", priority: "LOW",
                comment_count: 0, labels: [{ id: 7, name: "Database", color: "green" }],
                assignees: [{ id: 3, full_name: "Bình", avatar_url: "https://i.pravatar.cc/150?u=3" }]
            },
            {
                id: 402, column_id: 4, title: "Deploy bản Alpha lên Vercel", priority: "MEDIUM",
                comment_count: 4, labels: [{ id: 8, name: "DevOps", color: "volcano" }],
                assignees: []
            }
        ]
    }
];

const ProjectDetail = () => {
    const navigate = useNavigate();
    const { workspaceId, projectId } = useParams();

    const [columns] = useState<Column[]>(MOCK_COLUMNS);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    // Fix lỗi implicitly has 'any' type cho priority
    const getPriorityTag = (priority: Priority) => {
        const colorMap: Record<Priority, string> = {
            HIGH: 'red',
            MEDIUM: 'orange',
            LOW: 'blue'
        };
        return <Tag color={colorMap[priority]}>{priority}</Tag>;
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDrawerOpen(true);
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7f9' }}>
            {/* HEADER SECTION */}
            <Header style={{ background: '#fff', padding: '16px 24px', height: 'auto', borderBottom: '1px solid #f0f0f0' }}>
                <Breadcrumb items={[{ title: 'Workspaces' }, { title: 'Dự án CMS' }]} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <Space size="large">
                        <Title level={3} style={{ margin: 0 }}>Quản lý dự án DucCTMS</Title>
                        <Avatar.Group maxCount={3}>
                            <Avatar src="https://i.pravatar.cc/150?u=1" />
                            <Avatar src="https://i.pravatar.cc/150?u=2" />
                            <Button shape="circle" icon={<UserAddOutlined />} />
                        </Avatar.Group>
                    </Space>
                    <Space>
                        <Input prefix={<SearchOutlined />} placeholder="Tìm task..." />
                        <Button
                            type="primary"
                            icon={<TeamOutlined />}
                            onClick={() => navigate(`/workspace/${workspaceId}/projects/${projectId}/members`)}
                        >
                            Quản lý thành viên
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />}>Thêm cột</Button>
                    </Space>
                </div>
            </Header>

            {/* KANBAN BOARD SECTION */}
            <Content style={{ padding: '24px', overflowX: 'auto', display: 'flex', gap: '16px' }}>
                {columns.map(col => (
                    <div key={col.id} style={{ width: 300, minWidth: 300 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
                            <Text strong>{col.name} <Badge count={col.tasks.length} showZero color="#bfbfbf" style={{ marginLeft: 8 }} /></Text>
                            <Button type="text" size="small" icon={<EllipsisOutlined />} />
                        </div>

                        <Space direction="vertical" style={{ width: '100%' }} size={12}>
                            {col.tasks.map(task => (
                                <Card
                                    key={task.id}
                                    hoverable
                                    size="small"
                                    onClick={() => handleTaskClick(task)}
                                    style={{ borderRadius: 8, border: '1px solid #e8e8e8' }}
                                >
                                    <div style={{ marginBottom: 8 }}>
                                        {task.labels.map(l => (
                                            <Tag key={l.id} color={l.color} style={{ fontSize: 10, borderRadius: 10 }}>{l.name}</Tag>
                                        ))}
                                    </div>
                                    <Text strong style={{ display: 'block', marginBottom: 12 }}>{task.title}</Text>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Space size="middle">
                                            {task.due_date && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    <ClockCircleOutlined style={{ marginRight: 4 }} />{task.due_date}
                                                </Text>
                                            )}
                                            {task.comment_count > 0 && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    <MessageOutlined style={{ marginRight: 4 }} />{task.comment_count}
                                                </Text>
                                            )}
                                        </Space>
                                        <Avatar size="small" src={`https://i.pravatar.cc/150?u=${task.id}`} />
                                    </div>
                                    <div style={{ marginTop: 10 }}>
                                        {getPriorityTag(task.priority)}
                                    </div>
                                </Card>
                            ))}
                            <Button type="text" block icon={<PlusOutlined />} style={{ textAlign: 'left', color: '#595959' }}>
                                Thêm thẻ mới
                            </Button>
                        </Space>
                    </div>
                ))}
            </Content>

            {/* TASK DETAIL DRAWER */}
            <Drawer
                title="Chi tiết công việc"
                width={500}
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                extra={<Button type="text" icon={<MoreOutlined />} />}
            >
                {selectedTask && (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div>
                            <Text type="secondary">Tiêu đề</Text>
                            <Title level={4} style={{ marginTop: 4 }}>{selectedTask.title}</Title>
                        </div>

                        <div>
                            <Text strong>Mô tả</Text>
                            <Input.TextArea
                                rows={4}
                                placeholder="Thêm mô tả chi tiết cho nhiệm vụ này..."
                                style={{ marginTop: 8 }}
                                defaultValue={selectedTask.description}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 40 }}>
                            <div>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Người thực hiện</Text>
                                <Avatar src="https://i.pravatar.cc/150?u=1" /> <Text>Đức Nguyễn</Text>
                            </div>
                            <div>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Độ ưu tiên</Text>
                                {getPriorityTag(selectedTask.priority)}
                            </div>
                        </div>

                        <Divider />

                        <div>
                            <Text strong>Hoạt động</Text>
                            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                                <Avatar src="https://i.pravatar.cc/150?u=me" />
                                <Input placeholder="Viết bình luận..." />
                            </div>
                        </div>
                    </Space>
                )}
            </Drawer>
        </Layout>
    );
};

export default ProjectDetail;