import React from 'react';
import { Modal, Form, Input, ColorPicker } from 'antd';

interface ProjectModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    loading: boolean;
    initialValues?: any;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ open, onCancel, onSubmit, loading, initialValues }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            const colorHex = typeof values.color === 'string' ? values.color : values.color.toHexString();
            onSubmit({ ...values, color: colorHex });
        });
    };

    return (
        <Modal
            title={initialValues ? "Chỉnh sửa dự án" : "Tạo dự án mới"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            cancelText="Hủy"
            destroyOnHidden
        >
            <Form form={form} layout="vertical" initialValues={{ color: '#1677ff' }}>
                <Form.Item
                    name="name"
                    label="Tên dự án"
                    rules={[{ required: true, message: 'Vui lòng nhập tên dự án!' }]}
                >
                    <Input placeholder="Ví dụ: App quản lý chi tiêu..." />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={3} placeholder="Nhập mô tả ngắn gọn về mục tiêu dự án" />
                </Form.Item>

                <Form.Item name="color" label="Màu sắc chủ đạo">
                    <ColorPicker showText />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProjectModal;