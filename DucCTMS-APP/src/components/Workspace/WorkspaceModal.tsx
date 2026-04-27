import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useCreateWorkspace, useUpdateWorkspace } from '../../hooks/useWorkspaces';
import type { Workspace } from '../../types/workspace';

interface Props {
    open: boolean;
    onCancel: () => void;
    initialValues?: Workspace | null;
    onSuccess?: (data: any) => void;
}

const WorkspaceModal: React.FC<Props> = ({ open, onCancel, initialValues, onSuccess }) => {
    const [form] = Form.useForm();
    const isEdit = !!initialValues;

    const { mutate: createWorkspace, isPending: isCreating } = useCreateWorkspace();
    const { mutate: updateWorkspace, isPending: isUpdating } = useUpdateWorkspace();

    // Reset form hoặc set giá trị khi initialValues thay đổi hoặc mở modal
    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            if (isEdit && initialValues) {
                // Gọi API Update
                updateWorkspace({ id: initialValues.id, data: values }, {
                    onSuccess: (data) => {
                        onCancel();
                        if (onSuccess) onSuccess(data);
                    }
                });
            } else {
                // Gọi API Create
                createWorkspace(values, {
                    onSuccess: (data) => {
                        form.resetFields();
                        onCancel();
                        if (onSuccess) onSuccess(data);
                    },
                });
            }
        });
    };

    return (
        <Modal
            title={isEdit ? "Chỉnh sửa Workspace" : "Tạo Workspace mới"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={isCreating || isUpdating}
            okText={isEdit ? "Cập nhật" : "Tạo mới"}
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên Workspace"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên workspace!' },
                        { min: 3, message: 'Tên phải có ít nhất 3 ký tự!' }
                    ]}
                >
                    <Input placeholder="VD: Dự án tốt nghiệp, Team Marketing..." />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea rows={3} placeholder="Nhập mô tả ngắn gọn về workspace này" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default WorkspaceModal;