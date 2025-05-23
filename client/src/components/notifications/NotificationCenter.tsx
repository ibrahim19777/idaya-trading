import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Bell, TrendingUp, TrendingDown, AlertTriangle, Settings } from 'lucide-react';
import type { Notification } from '@shared/schema';

export function NotificationCenter() {
  const { user } = useAuth();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', user?.id],
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest('PUT', `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', user?.id] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'profit':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'loss':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'market':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Settings className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'profit':
        return 'bg-green-500';
      case 'loss':
        return 'bg-red-500';
      case 'market':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Notification Settings */}
      <div className="lg:col-span-1">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>إعدادات التنبيهات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="profit-notifications">تنبيهات الأرباح</Label>
                <Switch id="profit-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="loss-notifications">تنبيهات الخسائر</Label>
                <Switch id="loss-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="market-notifications">تنبيهات السوق</Label>
                <Switch id="market-notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="system-notifications">تنبيهات النظام</Label>
                <Switch id="system-notifications" defaultChecked />
              </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="profit-threshold">حد تنبيه الربح ($)</Label>
                <Input
                  id="profit-threshold"
                  type="number"
                  defaultValue="100"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="loss-threshold">حد تنبيه الخسارة ($)</Label>
                <Input
                  id="loss-threshold"
                  type="number"
                  defaultValue="50"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Notifications List */}
      <div className="lg:col-span-2">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>آخر التنبيهات</CardTitle>
              <Button variant="outline" size="sm">
                تعيين الكل كمقروء
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">لا توجد تنبيهات حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.isRead 
                        ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                        : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 ${getNotificationColor(notification.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <Badge variant="default" className="bg-blue-500">
                              جديد
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(notification.createdAt!).toLocaleString('ar')}
                          </p>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                            >
                              تعيين كمقروء
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
