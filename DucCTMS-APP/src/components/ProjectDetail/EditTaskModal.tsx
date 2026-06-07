import { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTaskDetail, useUpdateTask } from '../../hooks/useTask';

interface EditTaskModalProps {
    open: boolean;
    taskId: number | null;
    onCancel: () => void;
}
const { Option } = Select;
const { TextArea } = Input;

const EditTaskModal = ({ open, taskId, onCancel }: EditTaskModalProps) => {
    const [form] = Form.useForm();
    const { workspaceId, projectId } = useParams();

    const { data: freshTask } = useTaskDetail(workspaceId, projectId, taskId);
    const { mutate: updateTask, isPending } = useUpdateTask(workspaceId, projectId, taskId);

    useEffect(() => {
        // Lắng nghe freshTask thay vì task cũ
        if (freshTask && open) {
            form.setFieldsValue({
                title: freshTask.title,
                description: freshTask.description,
                priority: freshTask.priority,
                // Chú ý: DTO của bạn trả về là due_date (snake_case) 
                dueDate: freshTask.due_date ? dayjs(freshTask.due_date) : null,
            });
        }
    }, [freshTask, open, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            const formattedValues = {
                ...values,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DDTHH:mm:ssZ') : null,
            };

            updateTask({ taskId: taskId!, data: formattedValues }, {
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
            open={open}
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
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" showTime={{ format: 'HH:mm' }} />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default EditTaskModal;