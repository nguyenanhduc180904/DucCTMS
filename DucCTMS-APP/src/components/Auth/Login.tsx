import { Form, Input, Button, Card, Typography, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLogin } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = () => {

    const { mutate, isPending } = useLogin();

    const onFinish = (values: any) => {
        mutate(values);
    };
    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 12 }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 4 }}>Đăng Nhập</Title>
                        <Text type="secondary">Chào mừng bạn quay trở lại!</Text>
                    </div>

                    <Form
                        name="login_form"
                        initialValues={{ remember: true }}
                        layout="vertical"
                        size="middle"
                        onFinish={onFinish}
                        requiredMark={false}
                    >
                        <Form.Item
                            label="Tên đăng nhập"
                            name="username"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 16, marginTop: 10 }}>
                            <Button loading={isPending} type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Đăng nhập
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            <Text style={{ fontSize: '13px' }}>
                                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                            </Text>
                        </div>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};


export default Login;