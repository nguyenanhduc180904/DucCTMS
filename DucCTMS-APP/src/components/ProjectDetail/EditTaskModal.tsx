import { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useUpdateTask } from '../../hooks/useTask';
import type { Task } from '.';

interface EditTaskModalProps {
    task: Task | null;
    onCancel: () => void;
}

const { Option } = Select;
const { TextArea } = Input;

const EditTaskModal = ({ task, onCancel }: EditTaskModalProps) => {
    const [form] = Form.useForm();
    const { workspaceId, projectId } = useParams();
    const { mutate: updateTask, isPending } = useUpdateTask(workspaceId, projectId);

    useEffect(() => {
        if (task) {
            form.setFieldsValue({
                title: task.title,
                description: task.description,
                priority: task.priority,
                // Chuyển string date thành object của dayjs để DatePicker hiểu
                dueDate: task.due_date ? dayjs(task.due_date) : null,
            });
        }
    }, [task, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            const formattedValues = {
                ...values,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DDTHH:mm:ssZ') : null,
            };

            updateTask({ taskId: task!.id, data: formattedValues }, {
                onSuccess: () => {
                    form.resetFields();
                    onCancel();
                }
            });
        });
    };

    return (
        <Modal
            title="Sửa nhiệm vụ"
            open={!!task}
            onOk={handleOk}
            onCancel={onCancel}
            zIndex={1100}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            confirmLoading={isPending}
            width={600}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                    <Input placeholder="Nhập tiêu đề..." />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={4} />
                </Form.Item>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="priority" label="Độ ưu tiên" style={{ flex: 1 }}>
                        <Select>
                            <Option value="LOW">Thấp</Option>
                            <Option value="MEDIUM">Trung bình</Option>
                            <Option value="HIGH">Cao</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="dueDate" label="Hạn chót" style={{ flex: 1 }}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default EditTaskModal;