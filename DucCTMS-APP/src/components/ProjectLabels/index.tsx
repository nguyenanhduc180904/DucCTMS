import React, { useState } from 'react';
import { Table, Space, Input, Card, Typography, Button, message, Modal, Tooltip, Tag, ColorPicker, Skeleton } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCreateLabel, useDeleteLabel, useProjectLabels, useUpdateLabel, type LabelDTO } from '../../hooks/useLabel';

const { Title, Text } = Typography;

const ProjectLabelsPage: React.FC = () => {
    const navigate = useNavigate();
    const { workspaceId, projectId } = useParams();

    // Gọi API thông qua React Query
    const { data: labels = [], isLoading, isError } = useProjectLabels(workspaceId, projectId);
    const { mutate: createLabel, isPending: isCreating } = useCreateLabel(workspaceId, projectId);
    const { mutate: updateLabel, isPending: isUpdating } = useUpdateLabel(workspaceId, projectId);
    const { mutate: deleteLabel } = useDeleteLabel(workspaceId, projectId);

    const [searchText, setSearchText] = useState('');

    // State quản lý Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingLabel, setEditingLabel] = useState<LabelDTO | null>(null);

    // State Form
    const [labelName, setLabelName] = useState('');
    const [labelColor, setLabelColor] = useState('#1677ff');

    const filteredLabels = labels.filter(label =>
        label.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleOpenCreate = () => {
        setModalMode('create');
        setEditingLabel(null);
        setLabelName('');
        setLabelColor('#1677ff');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (record: LabelDTO) => {
        setModalMode('edit');
        setEditingLabel(record);
        setLabelName(record.name);
        setLabelColor(record.color);
        setIsModalOpen(true);
    };

    const handleModalSubmit = () => {
        if (!labelName.trim()) {
            return message.warning('Vui lòng nhập tên nhãn!');
        }

        const dataSubmit = { name: labelName.trim(), color: labelColor };

        if (modalMode === 'create') {
            createLabel(dataSubmit, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            if (editingLabel) {
                updateLabel({ labelId: editingLabel.id, data: dataSubmit }, {
                    onSuccess: () => setIsModalOpen(false)
                });
            }
        }
    };

    const showDeleteConfirm = (record: LabelDTO) => {
        Modal.confirm({
            title: 'Xác nhận xóa nhãn',
            icon: <ExclamationCircleOutlined />,
            content: (
                <span>
                    Bạn có chắc chắn muốn xóa nhãn <Tag color={record.color}>{record.name}</Tag>?
                    Các nhiệm vụ đang gắn nhãn này sẽ bị gỡ nhãn.
                </span>
            ),
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                deleteLabel(record.id);
            },
        });
    };

    const columns = [
        {
            title: 'Nhãn hiển thị',
            key: 'label',
            render: (_: any, record: LabelDTO) => (
                <Tag color={record.color} style={{ fontSize: 13, padding: '4px 12px', fontWeight: 500 }}>
                    {record.name}
                </Tag>
            ),
        },
        {
            title: 'Mã màu (Hex)',
            dataIndex: 'color',
            key: 'color',
            render: (color: string) => <Text code>{color.toUpperCase()}</Text>,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right' as const,
            render: (_: any, record: LabelDTO) => (
                <Space size="small">
                    <Tooltip title="Sửa nhãn">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            style={{ color: '#1677ff' }}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa nhãn">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteConfirm(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    if (isError) return <Card>Có lỗi xảy ra khi tải danh sách nhãn.</Card>;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/workspace/${workspaceId}/projects/${projectId}`)}
                    style={{ paddingLeft: 0, marginBottom: 8 }}
                >
                    Quay lại dự án
                </Button>
                <Title level={3} style={{ marginTop: 0 }}>Quản lý nhãn dự án</Title>
                <Text type="secondary">Tạo, chỉnh sửa và cấu hình màu sắc cho các nhãn phân loại công việc.</Text>
            </div>

            <Card
                styles={{ body: { padding: 0 } }}
                style={{ borderRadius: 8, overflow: 'hidden' }}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                        <span>Tất cả nhãn ({filteredLabels.length})</span>
                        <Space size="middle">
                            <Input
                                placeholder="Tìm kiếm nhãn..."
                                prefix={<SearchOutlined />}
                                style={{ width: 230 }}
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleOpenCreate}
                            >
                                Thêm nhãn mới
                            </Button>
                        </Space>
                    </div>
                }
            >
                {isLoading ? (
                    <div style={{ padding: 24 }}><Skeleton active /></div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredLabels}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: 'Không có dữ liệu' }}
                    />
                )}
            </Card>

            <Modal
                title={modalMode === 'create' ? "Thêm nhãn mới" : "Chỉnh sửa thông tin nhãn"}
                open={isModalOpen}
                onOk={handleModalSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText={modalMode === 'create' ? "Thêm mới" : "Cập nhật"}
                cancelText="Hủy bỏ"
                confirmLoading={isCreating || isUpdating}
                destroyOnClose
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20, marginBottom: 10 }}>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>
                            Tên nhãn <span style={{ color: '#ff4d4f' }}>*</span>
                        </Text>
                        <Input
                            placeholder="Nhập tên nhãn (Ví dụ: Bug, Feature, Khẩn cấp...)"
                            value={labelName}
                            onChange={(e) => setLabelName(e.target.value)}
                            onPressEnter={handleModalSubmit}
                        />
                    </div>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 6 }}>Màu sắc đại diện</Text>
                        <Space size="middle" style={{ width: '100%' }}>
                            <ColorPicker
                                format="hex"
                                value={labelColor}
                                onChange={(_, hex) => setLabelColor(hex)}
                            />
                            <Input
                                value={labelColor.toUpperCase()}
                                onChange={(e) => setLabelColor(e.target.value)}
                                style={{ width: 120 }}
                                placeholder="#Hex code"
                            />
                            <div style={{ marginLeft: 16 }}>
                                <Text type="secondary" style={{ marginRight: 8, fontSize: 12 }}>Preview:</Text>
                                <Tag color={labelColor || '#1677ff'}>
                                    {labelName || 'Tên nhãn'}
                                </Tag>
                            </div>
                        </Space>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectLabelsPage;