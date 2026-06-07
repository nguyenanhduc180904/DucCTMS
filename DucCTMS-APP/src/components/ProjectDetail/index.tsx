import { useState, useEffect } from 'react';
import {
    Layout, Button,
    Tag, Card, Badge, Space, Typography,
    Input, Spin,
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
    TagsOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectBoard, useProjectDetail } from '../../hooks/useProject';
import AddColumnModal from './AddColumnModal';
import EditColumnModal from './EditColumnModal';
import { useDeleteColumn, useReorderColumns } from '../../hooks/useColumn';
import AddTaskModal from './AddTaskModal';
import { useDeleteTask, useReorderTasks } from '../../hooks/useTask';
import EditTaskModal from './EditTaskModal';
import TaskDetailDrawer from './TaskDetailDrawer';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

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
    const { data: projectInfo } = useProjectDetail(workspaceId, projectId);
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <Space size="middle" align="center">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(`/workspace/${workspaceId}/projects`)}
                            style={{ fontSize: '18px', width: 32, height: 32, padding: 0 }}
                        />
                        <Title level={3} style={{ margin: 0 }}>
                            {projectInfo?.name || <Spin size="small" />}
                        </Title>
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
                                                                            <Card
                                                                                hoverable
                                                                                size="small"
                                                                                onClick={() => handleTaskClick(task)}
                                                                                style={{
                                                                                    borderRadius: 8,
                                                                                    boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none'
                                                                                }}
                                                                            >
                                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 4 }}>
                                                                                    {task.labels && task.labels.length > 0 && (
                                                                                        <>
                                                                                            {/* Chỉ hiển thị tối đa 3 nhãn đầu tiên trên Card */}
                                                                                            {task.labels.slice(0, 3).map(l => (
                                                                                                <Tag
                                                                                                    key={l.id}
                                                                                                    color={l.color}
                                                                                                    style={{ fontSize: 10, margin: 0, padding: '0 6px', lineHeight: '18px' }}
                                                                                                >
                                                                                                    {l.name}
                                                                                                </Tag>
                                                                                            ))}

                                                                                            {/* Nếu lớn hơn 3 nhãn, gom thành thẻ +N */}
                                                                                            {task.labels.length > 3 && (
                                                                                                <Tag
                                                                                                    style={{
                                                                                                        fontSize: 10, margin: 0, padding: '0 6px',
                                                                                                        lineHeight: '18px', background: '#f5f5f5',
                                                                                                        borderStyle: 'dashed', color: '#8c8c8c'
                                                                                                    }}
                                                                                                >
                                                                                                    +{task.labels.length - 3}
                                                                                                </Tag>
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </div>

                                                                                <Text strong style={{ display: 'block', margin: '4px 0 8px 0' }}>{task.title}</Text>

                                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                                    <Space size="small">
                                                                                        {task.due_date && <Text type="secondary" style={{ fontSize: 11 }}><ClockCircleOutlined /> {dayjs(task.due_date).format('HH:mm - DD/MM/YYYY')}</Text>}
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

            <TaskDetailDrawer
                open={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedTask(null);
                }}
                taskId={selectedTask?.id || null}
                workspaceId={workspaceId}
                projectId={projectId}
                onEditTask={() => setIsEditTaskModalOpen(true)}
                onDeleteTask={() => handleDeleteTask(selectedTask!)}
            />

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
                open={isEditTaskModalOpen}
                taskId={selectedTask?.id || null}
                onCancel={() => setIsEditTaskModalOpen(false)}
            />
        </Layout>
    );
};

export default ProjectDetail;