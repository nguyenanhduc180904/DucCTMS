import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useParams } from 'react-router-dom';
import type { Column } from '.';
import { useUpdateColumn } from '../../hooks/useColumn';

interface EditColumnModalProps {
    column: Column | null; // Truyền nguyên object cột vào
    onCancel: () => void;
}

const EditColumnModal = ({ column, onCancel }: EditColumnModalProps) => {
    const [form] = Form.useForm();
    const { workspaceId, projectId } = useParams();

    const { mutate: updateColumn, isPending } = useUpdateColumn(workspaceId, projectId);

    useEffect(() => {
        if (column) {
            form.setFieldsValue({ name: column.name });
        }
    }, [column, form]);

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                // Mở khối lệnh gọi API này
                updateColumn({ columnId: column!.id, data: values }, {
                    onSuccess: () => {
                        form.resetFields();
                        onCancel();
                    }
                });
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            confirmLoading={isPending}
            title="Sửa tên cột"
            open={!!column} // Mở nếu biến column có dữ liệu
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Lưu thay đổi"
            cancelText="Hủy"
        // confirmLoading={isPending}
        >
            <Form form={form} layout="vertical" name="editColumnForm">
                <Form.Item
                    name="name"
                    label="Tên cột"
                    rules={[{ required: true, message: 'Vui lòng nhập tên cột!' }]}
                >
                    <Input placeholder="Nhập tên cột..." autoFocus />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditColumnModal;