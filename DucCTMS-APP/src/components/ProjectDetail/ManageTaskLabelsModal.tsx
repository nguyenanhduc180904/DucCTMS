import React, { useState } from 'react';
import { Modal, Table, Input, Tag, Button, Tooltip, Skeleton } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProjectLabels } from '../../hooks/useLabel';
import { useAddLabelToTask, useRemoveLabelFromTask } from '../../hooks/useTask';

interface ManageTaskLabelsModalProps {
    open: boolean;
    onCancel: () => void;
    taskId: number | null;
    workspaceId: string | undefined;
    projectId: string | undefined;
    currentLabels: any[]; // Mảng nhãn hiện tại của Task
}

const ManageTaskLabelsModal: React.FC<ManageTaskLabelsModalProps> = ({
    open, onCancel, taskId, workspaceId, projectId, currentLabels
}) => {
    const [searchText, setSearchText] = useState('');

    // Lấy toàn bộ nhãn hiện có của Project này
    const { data: projectLabels = [], isLoading } = useProjectLabels(workspaceId, projectId);

    // Các hook xử lý Gán / Gỡ nhãn
    const { mutate: addLabel, isPending: isAdding } = useAddLabelToTask(workspaceId, projectId, taskId);
    const { mutate: removeLabel, isPending: isRemoving } = useRemoveLabelFromTask(workspaceId, projectId, taskId);

    // Bộ lọc nhãn theo từ khóa tìm kiếm
    const filteredLabels = projectLabels.filter(label =>
        label.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Kiểm tra xem một Label Id cụ thể đã được gán cho Task chưa
    const isLabelAssigned = (labelId: number) => {
        return currentLabels?.some(l => l.id === labelId);
    };

    const columns = [
        {
            title: 'Tên nhãn dự án',
            key: 'labelName',
            render: (_: any, record: any) => (
                <Tag color={record.color} style={{ fontSize: 13, padding: '2px 10px', fontWeight: 500 }}>
                    {record.name}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right' as const,
            render: (_: any, record: any) => {
                const assigned = isLabelAssigned(record.id);

                if (assigned) {
                    return (
                        <Tooltip title="Gỡ nhãn khỏi công việc">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                loading={isRemoving}
                                onClick={() => removeLabel(record.id)}
                            />
                        </Tooltip>
                    );
                }

                return (
                    <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        loading={isAdding}
                        onClick={() => addLabel(record.id)}
                    >
                        Gắn nhãn
                    </Button>
                );
            },
        },
    ];

    return (
        <Modal
            title="Gắn nhãn cho nhiệm vụ"
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            zIndex={1150} // zIndex lớn hơn Drawer (1000) để hiển thị đè lên trên mượt mà
        >
            <div style={{ marginBottom: 16, marginTop: 16 }}>
                <Input
                    placeholder="Tìm kiếm nhãn dự án..."
                    prefix={<SearchOutlined />}
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
                <Table
                    columns={columns}
                    dataSource={filteredLabels}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    size="small"
                    locale={{ emptyText: 'Không tìm thấy nhãn nào' }}
                />
            )}
        </Modal>
    );
};

export default ManageTaskLabelsModal;