import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import adminService from '../../services/admin.service';
import Navbar from '../shared/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    localShipping: 0,
    internationalShipping: 0,
    companyRequests: 0
  });
  const [chartData, setChartData] = useState([]);
  const [orderStatus, setOrderStatus] = useState({
    new: 0,
    reviewing: 0,
    notAcceptable: 0,
    accepted: 0,
    rejected: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orders, requests] = await Promise.all([
        adminService.getAllOrders(),
        adminService.getRegistrationRequests()
      ]);

      const allOrders = orders?.data?.data || [];
      const allRequests = requests?.data?.data || [];

      setStats({
        totalOrders: allOrders.length,
        localShipping: allOrders.filter(o => o.order_type === 'local').length,
        internationalShipping: allOrders.filter(o => o.order_type === 'international').length,
        companyRequests: allRequests.filter(r => r.status === 'pending').length
      });

      const statuses = {
        new: allOrders.filter(o => o.status === 'new').length,
        reviewing: allOrders.filter(o => o.status === 'reviewing').length,
        not_acceptable: allOrders.filter(o => o.status === 'not_acceptable').length,
        accepted: allOrders.filter(o => o.status === 'accepted').length,
        rejected: allOrders.filter(o => o.status === 'rejected').length
      };
      
      setOrderStatus(statuses);

      // Prepare data for Recharts
      const data = [
        { name: 'جديد', value: statuses.new, color: '#3B82F6' },
        { name: 'مراجعة', value: statuses.reviewing, color: '#EAB308' },
        { name: 'غير مقبول', value: statuses.not_acceptable, color: '#6B7280' },
        { name: 'مقبول', value: statuses.accepted, color: '#22C55E' },
        { name: 'مرفوض', value: statuses.rejected, color: '#EF4444' },
      ];
      setChartData(data);

      setRecentOrders(allOrders.slice(0, 5)); 
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderTypeLabel = (type) => {
    const labels = {
      international: 'شحن دولي',
      local: 'شحن محلي',
      chinese: 'متاجر صينية',
      shein: 'شي ان'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      not_acceptable: 'bg-gray-100 text-gray-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.new;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
          <p className="text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          لوحة التحكم الرئيسية
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          نظرة عامة على جميع العمليات
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">كل الطلبات</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.totalOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <i className="fas fa-list text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-r-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">شحن محلي</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.localShipping}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
              <i className="fas fa-truck text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-r-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">شحن دولي</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.internationalShipping}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
              <i className="fas fa-globe text-xl"></i>
            </div>
          </div>
        </div>

        <div className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-r-4 border-green-500 hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/company-requests')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">طلبات الشركات</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.companyRequests}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              <i className="fas fa-money-check text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">حالة الطلبات</h2>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="value" name="العدد" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">أحدث الطلبات</h2>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="text-primary hover:text-primary-dark text-sm font-semibold"
            >
              عرض الكل
            </button>
          </div>
          
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد طلبات حتى الآن</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <i className="fas fa-box"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">#{order.id.toString().slice(-6)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.formData?.clientName || 'عميل'}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-semibold">
                      {getOrderTypeLabel(order.order_type)}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'new')}`}>
                      {order.status || 'جديد'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
