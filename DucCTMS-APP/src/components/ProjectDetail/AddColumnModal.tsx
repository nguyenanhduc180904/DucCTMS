import { Modal, Form, Input } from 'antd';
import { useParams } from 'react-router-dom';
import { useCreateColumn } from '../../hooks/useColumn';

interface AddColumnModalProps {
    open: boolean;
    onCancel: () => void;
}

const AddColumnModal = ({ open, onCancel }: AddColumnModalProps) => {
    const [form] = Form.useForm();

    const { workspaceId, projectId } = useParams();

    // Gọi hook mutation
    const { mutate: addColumn, isPending } = useCreateColumn(workspaceId, projectId);

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                // Gọi API
                addColumn(values, {
                    onSuccess: () => {
                        form.resetFields(); // Reset form
                        onCancel();         // Đóng Modal khi thành công
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
            title="Thêm cột mới"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Tạo mới"
            cancelText="Hủy"
            confirmLoading={isPending} // Nút bấm sẽ tự xoay loading khi đang call API
        >
            <Form form={form} layout="vertical" name="addColumnForm">
                <Form.Item
                    name="name"
                    label="Tên cột"
                    rules={[{ required: true, message: 'Vui lòng nhập tên cột (VD: Cần làm, Kiểm thử)!' }]}
                >
                    <Input placeholder="Nhập tên cột..." autoFocus />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddColumnModal;