import { useState, useEffect } from 'react';
import { Badge, Popover, List, Typography, Avatar, Button, Divider, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useNotifications, useMarkAllNotificationsAsRead, useMarkNotificationAsRead } from '../../hooks/useNotification';
import { useMyProfile } from '../../hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

export interface AppNotification {
    id: number;
    userId: number;
    actorId: number;
    actorName: string;
    actorAvatar: string;
    type: string;
    entityId: number;
    entityType: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false);

    const queryClient = useQueryClient();
    const { data: myProfile } = useMyProfile();
    const { data: notifications = [], isLoading } = useNotifications();
    const { mutate: markAsRead } = useMarkNotificationAsRead();
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

    // WebSocket Effect
    useEffect(() => {
        if (!myProfile?.id) return;

        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                stompClient.subscribe(`/topic/notifications/${myProfile.id}`, (message) => {
                    if (message.body) {
                        const newNotification = JSON.parse(message.body);
                        
                        // Thêm thông báo mới vào đầu danh sách cache hiện tại
                        queryClient.setQueryData(['notifications'], (oldData: any) => {
                            if (!oldData) return [newNotification];
                            return [newNotification, ...oldData];
                        });
                    }
                });
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [myProfile?.id, queryClient]);

    // Lọc theo thuộc tính isRead hoặc is_read 
    const unreadCount = notifications.filter((n: any) => !n.isRead && !n.is_read).length;

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const handleNotificationClick = (notification: any) => {
        if (!notification.isRead && !notification.is_read) {
            markAsRead(notification.id);
        }
        // TODO: Call API and Navigate to the entity (Project, Task, etc.) based on entity_type and entity_id
    };

    const content = (
        <div style={{ width: 350, maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 12px 12px' }}>
                <Text strong style={{ fontSize: 16 }}>Thông báo</Text>
                {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={handleMarkAllAsRead} loading={isMarkingAll} icon={<CheckOutlined />}>
                        Đánh dấu đã đọc
                    </Button>
                )}
            </div>
            <Divider style={{ margin: 0 }} />
            <div style={{ overflowY: 'auto', flex: 1, minHeight: 100 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={notifications}
                        renderItem={(item: any) => {
                            const isItemRead = item.isRead || item.is_read;
                            return (
                                <List.Item
                                    style={{
                                        padding: '12px',
                                        cursor: 'pointer',
                                        background: isItemRead ? 'transparent' : '#e6f4ff',
                                        transition: 'background 0.3s'
                                    }}
                                    onClick={() => handleNotificationClick(item)}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.actorAvatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.actorId}`} />}
                                        title={
                                            <span style={{ fontWeight: isItemRead ? 'normal' : 'bold' }}>
                                                {item.actorName} <Text style={{ fontWeight: 'normal' }}>{item.content}</Text>
                                            </span>
                                        }
                                        description={<span style={{ fontSize: 12 }}>{dayjs(item.createdAt || item.created_at).fromNow()}</span>}
                                    />
                                    {!isItemRead && <Badge status="processing" />}
                                </List.Item>
                            );
                        }}
                        locale={{ emptyText: 'Không có thông báo nào' }}
                    />
                )}
            </div>
            <Divider style={{ margin: 0 }} />
            <div style={{ padding: '12px', textAlign: 'center' }}>
                <Button type="link" block>Xem tất cả</Button>
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            overlayInnerStyle={{ padding: '12px 0 0 0' }}
        >
            <Badge count={unreadCount} overflowCount={99} size="small">
                <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} />
            </Badge>
        </Popover>
    );
};

export default NotificationDropdown;
