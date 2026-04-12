import { useState } from 'react';
import {
    Card,
    Avatar,
    Descriptions,
    Button,
    Modal,
    Form,
    Input,
    Switch,
    message,
    Upload,
    Spin,
} from 'antd';
import { UserOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useMyProfile, useUpdateProfile } from '../../hooks/useUser';

const BASE_URL = "http://localhost:8080";

const UserProfile = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();

    const { data: userData, isLoading, isError } = useMyProfile();
    const updateProfileMutation = useUpdateProfile();

    // Mở modal và set giá trị vào form
    const showModal = () => {
        form.setFieldsValue({
            fullName: userData?.fullName,
            isActive: userData?.isActive,
        });
        setFileList([]);
        setIsModalOpen(true);
    };

    // Xử lý thay đổi file
    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        // Chỉ giữ lại file cuối cùng được chọn (Single upload)
        setFileList(newFileList.slice(-1));
    };

    // Xử lý khi bấm Lưu
    const handleOk = async () => {
        try {

            const values = await form.validateFields();
            const fileToUpload = fileList.length > 0 ? (fileList[0].originFileObj as File) : undefined;

            await updateProfileMutation.mutateAsync({
                userId: userData?.id!,
                values: values,
                file: fileToUpload
            });

            form.resetFields(['password', 'confirm_password']);
            setIsModalOpen(false);
            message.success('Cập nhật thành công!');
        } catch (error) {
            console.error('Update Failed:', error);
            const errorMessage = (error as any).response?.data?.message || 'Có lỗi xảy ra khi cập nhật!';
            message.error(errorMessage);
        }
    };

    // Xử lý trạng thái Loading và Error
    if (isLoading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    if (isError || !userData) return <div>Đã có lỗi xảy ra khi tải dữ liệu!</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Card
                title="Thông tin người dùng"
                extra={<Button type="primary" icon={<EditOutlined />} onClick={showModal}>Chỉnh sửa</Button>}
            >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Avatar size={100} src={userData.avatarUrl?.startsWith('blob')
                        ? userData.avatarUrl
                        : `${BASE_URL}${userData.avatarUrl}`
                    } icon={<UserOutlined />} />
                </div>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Username"><strong>{userData.username}</strong></Descriptions.Item>
                    <Descriptions.Item label="Họ và tên">{userData.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {userData.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Modal
                title="Cập nhật thông tin cá nhân"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                okText="Lưu thay đổi"
                cancelText="Hủy"
                confirmLoading={updateProfileMutation.isPending}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="user_edit_form"
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input />
                    </Form.Item>


                    <Form.Item label="Ảnh đại diện">
                        <Upload
                            listType="picture"
                            maxCount={1}
                            fileList={fileList}
                            onChange={handleChange}
                            beforeUpload={() => false}
                        >
                            <Button icon={<UploadOutlined />}>Chọn file ảnh</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu mới"
                        rules={[{ min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        name="confirm_password"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['password']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>

                    <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
                        <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserProfile;