import React, { useState } from 'react';
import { Card, Button, Typography, Input, Skeleton, Empty, Tooltip, Tag, Row, Col, Modal } from 'antd';
import { PlusOutlined, ProjectOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from '../../hooks/useProject';
import ProjectModal from './ProjectModal';

const { Title, Text } = Typography;
const { Paragraph } = Typography;

const ProjectsPage: React.FC = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);

    const { data: projects, isLoading, isError } = useProjects(workspaceId);
    const { mutate: createProject, isPending: isCreating } = useCreateProject(workspaceId);
    const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(workspaceId);
    const { mutate: deleteProject } = useDeleteProject(workspaceId);

    const filteredProjects = projects?.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleOpenCreate = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (project: any) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = (project: any) => {
        Modal.confirm({
            title: 'Xác nhận xóa dự án',
            content: `Bạn có chắc chắn muốn xóa dự án "${project.name}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => deleteProject(project.id),
        });
    };

    const handleSubmit = (values: any) => {
        if (editingProject) {
            updateProject({ projectId: editingProject.id, data: values }, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createProject(values, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    if (isError) return <Card>Đã có lỗi xảy ra khi tải danh sách dự án.</Card>;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Tiêu đề và Nút tạo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>Dự án của tôi</Title>
                    <Text type="secondary">Các dự án bạn đang tham gia trong không gian làm việc này.</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleOpenCreate}>
                    Tạo dự án
                </Button>
            </div>

            {/* Thanh tìm kiếm */}
            <Input
                placeholder="Tìm tên dự án..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: 300, marginBottom: 24, borderRadius: 6 }}
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
            />

            {/* Danh sách Project dạng Grid Card */}
            {isLoading ? (
                <div style={{ padding: '20px' }}><Skeleton active /></div>
            ) : filteredProjects && filteredProjects.length > 0 ? (
                <Row gutter={[20, 20]}>
                    {filteredProjects.map((project) => (
                        <Col key={project.id} xs={24} sm={12} md={8} lg={8} xl={6}>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: 12,
                                    borderTop: `6px solid ${project.color || '#1677ff'}`,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    height: '100%'
                                }}
                                actions={[
                                    <Tooltip title="Chỉnh sửa" key="edit">
                                        <EditOutlined key="edit" onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEdit(project);
                                        }} />,
                                    </Tooltip>,
                                    <Tooltip title="Xóa" key="delete">
                                        <DeleteOutlined
                                            style={{ color: '#ff4d4f' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(project);
                                            }}
                                        />
                                    </Tooltip>,
                                ]}
                            >
                                <div
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/workspace/${workspaceId}/projects/${project.id}`)}
                                >
                                    <Card.Meta
                                        avatar={
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 8,
                                                backgroundColor: `${project.color}15`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <ProjectOutlined style={{ fontSize: 20, color: project.color || '#1677ff' }} />
                                            </div>
                                        }
                                        title={<Text strong style={{ fontSize: 16 }}>{project.name}</Text>}
                                        description={
                                            <div style={{ height: 45 }}>
                                                <Paragraph
                                                    type="secondary"
                                                    ellipsis={{ rows: 2 }}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    {project.description || 'Không có mô tả cho dự án này.'}
                                                </Paragraph>
                                            </div>
                                        }
                                    />
                                </div>

                                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Tag color="blue" style={{ borderRadius: 10 }}>{project.taskCount} công việc</Tag>
                                    <Text type="secondary" style={{ fontSize: 11 }}>#ID: {project.id}</Text>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="Bạn chưa tham gia dự án nào trong workspace này." />
            )}

            <ProjectModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                loading={isCreating || isUpdating}
                initialValues={editingProject}
            />

        </div>
    );
};

export default ProjectsPage;