import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/order.service';
import LoadingSpinner from '../Shared/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatOrderField } from '../../utils/orderFormatters';

const AdminOrders = () => {
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('type');
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filterType]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllOrders();
      // response.data contains { data: [...], pagination: ... }
      let allOrders = response.data?.data || [];
      
      // Filter if type is specified in URL
      if (filterType) {
        allOrders = allOrders.filter(order => order.order_type === filterType);
      }
      
      // Sort by date descending
      allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      showError('فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) return;

    try {
      await adminService.deleteOrder(orderId);
      showSuccess('تم حذف الطلب بنجاح');
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      showError('فشل حذف الطلب');
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
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      not_acceptable: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || colors.new;
  };

  const getPageTitle = () => {
    if (!filterType) return 'إدارة الطلبات';
    return `طلبات ${getOrderTypeLabel(filterType)}`;
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    
    // Parse form data safely
    const formData = typeof order.form_data === 'string' 
      ? JSON.parse(order.form_data) 
      : order.form_data || {};

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                تفاصيل الطلب #{order.order_number || order.id.toString().slice(-6)}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString('ar-EG')}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300 font-medium">حالة الطلب</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                {order.status === 'new' ? 'جديد' : 
                 order.status === 'reviewing' ? 'قيد المراجعة' :
                 order.status === 'accepted' ? 'مقبول' : order.status}
              </span>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <i className="fas fa-user text-primary"></i>
                بيانات العميل
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">الاسم</p>
                  <p className="font-medium text-gray-800 dark:text-white">{order.customer?.full_name || 'غير متوفر'}</p>
                </div>
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-800 dark:text-white">{order.customer?.email || 'غير متوفر'}</p>
                </div>
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">الهاتف</p>
                  <p className="font-medium text-gray-800 dark:text-white">{order.customer?.phone || 'غير متوفر'}</p>
                </div>
              </div>
            </div>

            {/* Order Data */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <i className="fas fa-box-open text-primary"></i>
                تفاصيل الشحنة
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 space-y-3">
                {Object.entries(formData).map(([key, value]) => {
                  if (key === 'files' || typeof value === 'object') return null;
                  const { label, value: displayValue } = formatOrderField(key, value);
                  return (
                    <div key={key} className="flex justify-between border-b border-gray-200 dark:border-gray-600 last:border-0 pb-2 last:pb-0">
                      <span className="text-sm text-gray-500 capitalize">{label}</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white text-left" dir="auto">{displayValue}</span>
                    </div>


                  );
                })}
              </div>

              {/* Products List (Shein/Store Orders) */}
              {formData.products && Array.isArray(formData.products) && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <i className="fas fa-shopping-cart text-primary"></i>
                    المنتجات ({formData.products.length})
                  </h3>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="p-3 text-gray-600 dark:text-gray-200">المنتج</th>
                          <th className="p-3 text-gray-600 dark:text-gray-200">الكمية</th>
                          <th className="p-3 text-gray-600 dark:text-gray-200">السعر</th>
                          <th className="p-3 text-gray-600 dark:text-gray-200">الرابط</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {formData.products.map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-3">{p.name || `منتج ${idx+1}`}</td>
                            <td className="p-3">{p.qty}</td>
                            <td className="p-3">{p.price ? `$${p.price}` : '-'}</td>
                            <td className="p-3">
                              {p.link && (
                                <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                  <i className="fas fa-external-link-alt"></i>
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Files */}
            {formData.files && formData.files.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <i className="fas fa-paperclip text-primary"></i>
                  المرفقات
                </h3>
                <div className="space-y-2">
                  {formData.files.map((file, index) => (
                    <a 
                      key={index}
                      href={file.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <i className="fas fa-file-alt"></i>
                      <span className="text-sm font-medium truncate flex-1">{file.name || `مرفق ${index + 1}`}</span>
                      <i className="fas fa-external-link-alt text-xs"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isModalOpen && <OrderDetailsModal order={selectedOrder} onClose={() => setIsModalOpen(false)} />}
      
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {orders.length} طلب
          </p>
        </div>
        <button 
          onClick={loadOrders}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <i className="fas fa-sync-alt ml-2"></i>
          تحديث
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-md">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-4">
            <i className="fas fa-box-open"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            لا توجد طلبات
          </h3>
          <p className="text-gray-500">لم يتم استلام أي طلبات في هذا القسم بعد</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold text-sm">الإجراءات</th>
                  <th className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold text-sm">الحالة</th>
                  <th className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold text-sm">العنوان</th>
                  <th className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold text-sm">العميل</th>
                  <th className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold text-sm">النوع</th>
                  <th className="px-6 py-4 text-gray-600 dark:text-gray-300 font-semibold text-sm">رقم الطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100"
                          title="عرض التفاصيل"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center justify-center hover:bg-red-100"
                          title="حذف"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'new')}`}>
                        {order.status || 'جديد'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-800 dark:text-white font-medium max-w-xs truncate">
                          {order.formData?.deliveryAddress || order.formData?.address || '-'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(order.created_at).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                          <i className="fas fa-user text-xs"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {order.formData?.clientName || 'عميل'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{order.user_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg text-xs font-medium">
                        {getOrderTypeLabel(order.order_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-gray-600 dark:text-gray-400">
                        #{order.id.toString().slice(-6)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
