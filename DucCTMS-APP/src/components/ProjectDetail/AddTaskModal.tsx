import { Modal, Form, Input, Select, DatePicker } from 'antd';
import { useParams } from 'react-router-dom';
import { useCreateTask } from '../../hooks/useTask';

interface AddTaskModalProps {
    open: boolean;
    columnId: number | null; // Cột đích để thêm task vào
    onCancel: () => void;
}

const { Option } = Select;
const { TextArea } = Input;

const AddTaskModal = ({ open, columnId, onCancel }: AddTaskModalProps) => {
    const [form] = Form.useForm();
    const { workspaceId, projectId } = useParams();

    const { mutate: addTask, isPending } = useCreateTask(workspaceId, projectId);

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                const formattedValues = {
                    ...values,
                    columnId: columnId,
                    dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DDTHH:mm:ssZ') : null,
                };

                // 3. Mở logic gọi API
                addTask(formattedValues, {
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
            title="Thêm nhiệm vụ mới"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Tạo nhiệm vụ"
            cancelText="Hủy"
            width={600}
        >
            <Form form={form} layout="vertical" name="addTaskForm" initialValues={{ priority: 'MEDIUM' }}>
                <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề nhiệm vụ!' }]}
                >
                    <Input placeholder="Nhập tiêu đề..." autoFocus />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <TextArea rows={4} placeholder="Nhập mô tả chi tiết..." />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="priority"
                        label="Độ ưu tiên"
                        style={{ flex: 1 }}
                    >
                        <Select>
                            <Option value="LOW">Thấp (Low)</Option>
                            <Option value="MEDIUM">Trung bình (Medium)</Option>
                            <Option value="HIGH">Cao (High)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dueDate"
                        label="Hạn chót"
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày..." />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default AddTaskModal;