import { useState, useEffect } from 'react';
import {
    Layout, Breadcrumb, Button, Avatar,
    Tag, Card, Badge, Space, Typography,
    Input, Divider, Drawer, Spin,
    Modal,
    Dropdown
} from 'antd';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

import {
    PlusOutlined,
    ClockCircleOutlined,
    SearchOutlined,
    MoreOutlined,
    TeamOutlined,
    EditOutlined,
    DeleteOutlined,
    TagsOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectBoard } from '../../hooks/useProject';
import AddColumnModal from './AddColumnModal';
import EditColumnModal from './EditColumnModal';
import { useDeleteColumn, useReorderColumns } from '../../hooks/useColumn';
import AddTaskModal from './AddTaskModal';
import { useDeleteTask, useReorderTasks } from '../../hooks/useTask';
import EditTaskModal from './EditTaskModal';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Label {
    id: number;
    name: string;
    color: string;
}

export interface User {
    id: number;
    full_name: string;
    avatar_url: string;
}

export interface Task {
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

export interface Column {
    id: number;
    name: string;
    tasks: Task[];
}


const ProjectDetail = () => {
    const navigate = useNavigate();
    const { workspaceId, projectId } = useParams();

    const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [columns, setColumns] = useState<Column[]>([]);
    const [editingColumn, setEditingColumn] = useState<Column | null>(null);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
    const [selectedColumnIdForNewTask, setSelectedColumnIdForNewTask] = useState<number | null>(null);
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState<boolean>(false);

    // GỌI HOOK LẤY DỮ LIỆU API
    const { data: boardData, isLoading } = useProjectBoard(workspaceId, projectId);
    const { mutate: deleteColumn } = useDeleteColumn(workspaceId, projectId);
    const { mutate: deleteTask } = useDeleteTask(workspaceId, projectId);
    const { mutate: reorderColumnsMutation } = useReorderColumns(workspaceId, projectId);
    const { mutate: reorderTasksMutation } = useReorderTasks(workspaceId, projectId);

    // ĐỒNG BỘ DỮ LIỆU TỪ SERVER VÀO LOCAL STATE
    useEffect(() => {
        if (boardData) {
            setColumns(boardData);
        }
    }, [boardData]);

    //  Logic xóa task
    const handleDeleteTask = (task: Task) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Xóa nhiệm vụ "${task.title}"?`,
            okText: 'Xóa',
            okType: 'danger',
            onOk: () => {
                deleteTask(task.id, {
                    onSuccess: () => setIsDrawerOpen(false)
                });
            },
        });
    };

    //  Menu thao tác Task
    const taskMenu = {
        items: [
            {
                key: 'edit',
                icon: <EditOutlined style={{ color: '#1677ff' }} />,
                label: 'Sửa nhiệm vụ',
                onClick: () => setIsEditTaskModalOpen(true),
            },
            { type: 'divider' as const },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Xóa nhiệm vụ',
                danger: true,
                onClick: () => handleDeleteTask(selectedTask!),
            },
        ]
    };

    // Hàm mở Modal thêm Task
    const handleOpenAddTask = (columnId: number) => {
        setSelectedColumnIdForNewTask(columnId);
        setIsAddTaskModalOpen(true);
    };

    const handleDeleteColumn = (column: Column) => {
        Modal.confirm({
            title: 'Xác nhận xóa cột',
            content: `Bạn có chắc chắn muốn xóa cột "${column.name}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                deleteColumn(column.id);
            },
        });
    };

    // Khai báo Menu xổ xuống cho từng cột
    const getColumnMenu = (col: Column) => ({
        items: [
            {
                key: 'edit',
                icon: <EditOutlined style={{ color: '#1677ff' }} />,
                label: 'Sửa tên cột',
                onClick: () => setEditingColumn(col), // Mở modal sửa
            },
            {
                type: 'divider' as const,
            },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Xóa cột',
                danger: true,
                onClick: () => handleDeleteColumn(col), // Bật xác nhận xóa
            },
        ],
    });

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

    const onDragEnd = (result: DropResult) => {
        const { source, destination, type } = result;

        // Nếu thả ra ngoài khu vực cho phép
        if (!destination) return;

        // Nếu thả lại đúng vị trí cũ
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        // --- TRƯỜNG HỢP 1: KÉO THẢ CỘT ---
        if (type === 'column') {
            const newColumns = Array.from(columns);
            const [movedColumn] = newColumns.splice(source.index, 1);
            newColumns.splice(destination.index, 0, movedColumn);

            setColumns(newColumns);

            // Lấy ID và Index mới map thành mảng để gửi cho Backend
            const reorderPayload = newColumns.map((col, index) => ({
                id: col.id,
                position: index
            }));

            // Gọi API chạy ngầm
            reorderColumnsMutation(reorderPayload);
            return;
        }

        // --- TRƯỜNG HỢP 2: KÉO THẢ TASK ---
        const newColumns = [...columns];
        const sourceColIndex = newColumns.findIndex(c => c.id.toString() === source.droppableId);
        const destColIndex = newColumns.findIndex(c => c.id.toString() === destination.droppableId);

        const sourceCol = newColumns[sourceColIndex];
        const destCol = newColumns[destColIndex];

        const [movedTask] = sourceCol.tasks.splice(source.index, 1);
        movedTask.column_id = destCol.id;

        destCol.tasks.splice(destination.index, 0, movedTask);
        setColumns(newColumns);

        const updatedTasks: { id: number; columnId: number; position: number }[] = [];
        // Luôn gửi toàn bộ task của Cột đích (Destination Column) vì thứ tự đã thay đổi
        destCol.tasks.forEach((t, index) => {
            updatedTasks.push({ id: t.id, columnId: destCol.id, position: index });
        });

        // Nếu người dùng kéo task sang một cột KHÁC, thì cột nguồn (Source Column) cũng bị đổi thứ tự
        // Do đó, ta phải gửi cả task của cột nguồn xuống để update
        if (sourceCol.id !== destCol.id) {
            sourceCol.tasks.forEach((t, index) => {
                updatedTasks.push({ id: t.id, columnId: sourceCol.id, position: index });
            });
        }

        // Gọi API chạy ngầm
        reorderTasksMutation(updatedTasks);
    };

    if (isLoading) {
        return (
            <Layout style={{ minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Đang tải dữ liệu dự án..." />
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7f9' }}>
            {/* HEADER SECTION */}
            <Header style={{ background: '#fff', padding: '16px 24px', height: 'auto', borderBottom: '1px solid #f0f0f0' }}>
                <Breadcrumb items={[{ title: 'Workspaces' }, { title: 'Dự án CMS' }]} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <Space size="large">
                        <Title level={3} style={{ margin: 0 }}>Quản lý dự án DucCTMS</Title>

                    </Space>
                    <Space>
                        <Input prefix={<SearchOutlined />} placeholder="Tìm task..." />
                        <Button
                            icon={<TagsOutlined />}
                            onClick={() => navigate(`/workspace/${workspaceId}/projects/${projectId}/labels`)}                        >
                            Quản lý Nhãn
                        </Button>
                        <Button
                            type="primary"
                            icon={<TeamOutlined />}
                            onClick={() => navigate(`/workspace/${workspaceId}/projects/${projectId}/members`)}
                        >
                            Quản lý thành viên
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsAddColumnModalOpen(true)}
                        >
                            Thêm cột
                        </Button>
                    </Space>
                </div>
            </Header>

            {/* 3. KANBAN BOARD SECTION */}
            <DragDropContext onDragEnd={onDragEnd}>
                {/* Bọc toàn bộ các cột trong 1 Droppable (type="column") */}
                <Droppable droppableId="board" direction="horizontal" type="column">
                    {(provided) => (
                        <Content
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ padding: '24px', overflowX: 'auto', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
                        >
                            {columns.map((col, index) => (
                                /* Biến mỗi cột thành 1 Draggable */
                                <Draggable key={`column-${col.id}`} draggableId={`column-${col.id}`} index={index}>
                                    {(providedColumn, snapshotColumn) => (
                                        <div
                                            ref={providedColumn.innerRef}
                                            {...providedColumn.draggableProps}
                                            style={{
                                                width: 300, minWidth: 300,
                                                background: '#ebedf0',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                boxShadow: snapshotColumn.isDragging ? '0 5px 15px rgba(0,0,0,0.15)' : 'none',
                                                ...providedColumn.draggableProps.style
                                            }}
                                        >
                                            {/* Column Header - Khu vực nắm để kéo cột (dragHandleProps) */}
                                            <div
                                                {...providedColumn.dragHandleProps}
                                                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, cursor: 'grab' }}
                                            >
                                                <Text strong>{col.name} <Badge count={col.tasks.length} showZero color="#bfbfbf" /></Text>
                                                <Dropdown menu={getColumnMenu(col)} trigger={['click']} placement="bottomRight">
                                                    <Button type="text" icon={<MoreOutlined />} size="small" onClick={(e) => e.stopPropagation()} />
                                                </Dropdown>
                                            </div>

                                            {/* Droppable cho Tasks bên trong cột (type="task" mặc định) */}
                                            <Droppable droppableId={col.id.toString()} type="task">
                                                {(providedTask) => (
                                                    <div
                                                        ref={providedTask.innerRef}
                                                        {...providedTask.droppableProps}
                                                        style={{ minHeight: '10px', flexGrow: 1 }}
                                                    >
                                                        <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                                            {col.tasks.map((task, taskIndex) => (
                                                                <Draggable key={task.id} draggableId={task.id.toString()} index={taskIndex}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            style={{
                                                                                ...provided.draggableProps.style,
                                                                                userSelect: 'none',
                                                                                marginBottom: 8
                                                                            }}
                                                                        >
                                                                            {/* Card hiển thị task giữ nguyên như cũ */}
                                                                            <Card
                                                                                hoverable
                                                                                size="small"
                                                                                onClick={() => handleTaskClick(task)}
                                                                                style={{
                                                                                    borderRadius: 8,
                                                                                    boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none'
                                                                                }}
                                                                            >
                                                                                <div>
                                                                                    {task.labels?.map(l => (
                                                                                        <Tag key={l.id} color={l.color} style={{ fontSize: 10 }}>{l.name}</Tag>
                                                                                    ))}
                                                                                </div>
                                                                                <Text strong style={{ display: 'block', margin: '8px 0' }}>{task.title}</Text>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                    <Space size="small">
                                                                                        {task.due_date && <Text type="secondary" style={{ fontSize: 11 }}><ClockCircleOutlined /> {task.due_date}</Text>}
                                                                                    </Space>
                                                                                </div>
                                                                            </Card>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {providedTask.placeholder} {/* Giữ chỗ cho task */}
                                                        </Space>
                                                    </div>
                                                )}
                                            </Droppable>

                                            {/* Nút thêm nhiệm vụ */}
                                            <Button
                                                type="text"
                                                block
                                                icon={<PlusOutlined />}
                                                style={{ marginTop: 8, textAlign: 'left' }}
                                                onClick={() => handleOpenAddTask(col.id)}
                                            >
                                                Thêm nhiệm vụ mới
                                            </Button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder} {/* Giữ chỗ cho cột */}
                        </Content>
                    )}
                </Droppable>
            </DragDropContext>

            {/* TASK DETAIL DRAWER */}
            <Drawer
                title="Chi tiết công việc"
                width={500}
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                extra={
                    <Dropdown menu={taskMenu} trigger={['click']} placement="bottomRight">
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                }
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

            <AddColumnModal
                open={isAddColumnModalOpen}
                onCancel={() => setIsAddColumnModalOpen(false)}
            />

            <EditColumnModal
                column={editingColumn}
                onCancel={() => setEditingColumn(null)}
            />

            <AddTaskModal
                open={isAddTaskModalOpen}
                columnId={selectedColumnIdForNewTask}
                onCancel={() => {
                    setIsAddTaskModalOpen(false);
                    setSelectedColumnIdForNewTask(null); // Reset state khi đóng
                }}
            />

            <EditTaskModal
                task={isEditTaskModalOpen ? selectedTask : null}
                onCancel={() => setIsEditTaskModalOpen(false)}
            />
        </Layout>
    );
};

export default ProjectDetail;