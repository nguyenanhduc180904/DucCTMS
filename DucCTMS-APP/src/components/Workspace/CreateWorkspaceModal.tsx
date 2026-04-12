import React from 'react';
import { Modal, Form, Input } from 'antd';
import { useCreateWorkspace } from '../../hooks/useWorkspaces';

interface Props {
    open: boolean;
    onCancel: () => void;
    onSuccess?: (data: any) => void;
}

const CreateWorkspaceModal: React.FC<Props> = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const { mutate, isPending } = useCreateWorkspace();

    const handleOk = () => {
        form.validateFields().then((values) => {
            mutate(values, {
                onSuccess: (data) => {
                    form.resetFields();
                    if (onSuccess) onSuccess(data);
                    onCancel();
                },
            });
        });
    };

    return (
        <Modal
            title="Tạo Workspace mới"
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={isPending}
            okText="Tạo mới"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" name="create_workspace_form">
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

export default CreateWorkspaceModal;