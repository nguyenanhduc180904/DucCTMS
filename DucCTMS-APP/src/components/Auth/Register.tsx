import { Form, Input, Button, Card, Typography, Layout } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useRegister } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const Register = () => {
    const { mutate, isPending } = useRegister();

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 12 }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Title level={3} style={{ marginBottom: 4 }}>Đăng Ký</Title>
                        <Text type="secondary">Tạo tài khoản mới</Text>
                    </div>

                    <Form
                        name="register_form"
                        layout="vertical"
                        size="middle"
                        onFinish={mutate}
                        requiredMark={false}
                    >
                        <Form.Item
                            label="Tên đầy đủ"
                            name="fullName"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                            <Input prefix={<IdcardOutlined />} placeholder="Họ và tên" />
                        </Form.Item>

                        <Form.Item
                            label="Tên đăng nhập"
                            name="username"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Địa chỉ Email" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu"
                            name="confirm"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) return Promise.resolve();
                                        return Promise.reject(new Error('Mật khẩu không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 16, marginTop: 10 }}>
                            <Button loading={isPending} type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Đăng ký
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            <Text style={{ fontSize: '13px' }}>
                                Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                            </Text>
                        </div>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default Register;