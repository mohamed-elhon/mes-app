import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui';
import { Button, Skeleton } from '../../components/ui';
import { 
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { apiCall } from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';
import { formatPrice, formatNumber, generateRandomColor } from '../../utils/helpers';

// Chart component (simplified)
const Chart = ({ data, type = 'line', height = 200 }) => {
  return (
    <div className={`h-${height} bg-gray-50 dark:bg-gray-800 rounded-lg flex items-end justify-between p-4`}>
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-2">
          <div
            className="w-8 rounded-t-lg transition-all duration-300"
            style={{
              height: `${(item.value / Math.max(...data.map(d => d.value), 1)) * 100}%`,
              backgroundColor: generateRandomColor(),
            }}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Stat Card component
const StatCard = ({ title, value, icon: Icon, change, changeType = 'increase', color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-light text-success-dark',
    error: 'bg-error-light text-error-dark',
    warning: 'bg-warning-light text-warning-dark',
  };

  return (
    <Card className={colorClasses[color] || colorClasses.primary}>
      <CardContent className="p-4">
        <div className="flex-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className="text-xs mt-1 flex items-center gap-1">
                {changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className={changeType === 'increase' ? 'text-success' : 'text-error'}>
                  {change}
                </span>
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color === 'primary' ? 'bg-primary-100' : color === 'success' ? 'bg-success-light' : color === 'error' ? 'bg-error-light' : 'bg-warning-light'}`}>
            <Icon className={`w-6 h-6 ${color === 'primary' ? 'text-primary-600' : color === 'success' ? 'text-success-dark' : color === 'error' ? 'text-error-dark' : 'text-warning-dark'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Activity component
const RecentActivity = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {activities.map((activity, index) => (
            <div key={index} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Top Products component
const TopProducts = ({ products }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {products.map((product, index) => (
            <div key={product.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatPrice(product.price)} × {product.sold}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatPrice(product.revenue)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Revenue
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiCall('get', API_ENDPOINTS.DASHBOARD.STATS);
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err);
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Mock data for demonstration
  const mockStats = {
    totals: {
      users: 1250,
      products: 850,
      orders: 2450,
      revenue: 125000,
    },
    salesOverview: {
      totalRevenue: 125000,
      totalOrders: 2450,
      averageOrderValue: 51.02,
      totalItemsSold: 8500,
    },
    topSellingProducts: [
      { id: 1, name: 'Premium Headphones', price: 199, sold: 120, revenue: 23880, image: null },
      { id: 2, name: 'Smart Watch Pro', price: 249, sold: 95, revenue: 23655, image: null },
      { id: 3, name: 'Wireless Earbuds', price: 99, sold: 150, revenue: 14850, image: null },
      { id: 4, name: 'Bluetooth Speaker', price: 79, sold: 85, revenue: 6715, image: null },
      { id: 5, name: 'Fitness Tracker', price: 49, sold: 70, revenue: 3430, image: null },
    ],
    recentActivities: [
      { id: 1, title: 'New order #2450 placed', time: '2 min ago', icon: <ShoppingCart className="w-5 h-5 text-blue-600" /> },
      { id: 2, title: 'User John Doe registered', time: '5 min ago', icon: <Users className="w-5 h-5 text-green-600" /> },
      { id: 3, title: 'Product "Smart Watch" updated', time: '10 min ago', icon: <Package className="w-5 h-5 text-orange-600" /> },
      { id: 4, title: 'Order #2449 delivered', time: '15 min ago', icon: <CheckCircle className="w-5 h-5 text-green-600" /> },
      { id: 5, title: 'New review submitted', time: '20 min ago', icon: <Clock className="w-5 h-5 text-purple-600" /> },
    ],
    monthlySales: [
      { label: 'Jan', value: 8000 },
      { label: 'Feb', value: 10000 },
      { label: 'Mar', value: 12000 },
      { label: 'Apr', value: 15000 },
      { label: 'May', value: 18000 },
      { label: 'Jun', value: 22000 },
      { label: 'Jul', value: 25000 },
      { label: 'Aug', value: 28000 },
      { label: 'Sep', value: 25000 },
      { label: 'Oct', value: 22000 },
      { label: 'Nov', value: 18000 },
      { label: 'Dec', value: 15000 },
    ],
    orderStatus: {
      pending: 120,
      processing: 85,
      shipped: 245,
      delivered: 1980,
      cancelled: 20,
    },
  };

  // Use mock data if API fails
  const data = stats || mockStats;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="120px" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton height="300px" />
          <Skeleton height="300px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600 mb-4">Failed to load dashboard data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'Admin'}!</h1>
            <p className="text-primary-100 mt-1">Here's what's happening with your store today.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              View Reports
            </Button>
            <Button className="bg-white text-primary-600 hover:bg-white/90">
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatPrice(data.salesOverview?.totalRevenue || data.totals?.revenue || 0)}
          icon={DollarSign}
          change="+12.5%"
          changeType="increase"
          color="primary"
        />
        
        <StatCard
          title="Total Orders"
          value={formatNumber(data.totals?.orders || 0)}
          icon={ShoppingCart}
          change="+8.3%"
          changeType="increase"
          color="success"
        />
        
        <StatCard
          title="Total Products"
          value={formatNumber(data.totals?.products || 0)}
          icon={Package}
          change="+24"
          changeType="increase"
          color="warning"
        />
        
        <StatCard
          title="Total Users"
          value={formatNumber(data.totals?.users || 0)}
          icon={Users}
          change="+5.2%"
          changeType="increase"
          color="error"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart data={data.monthlySales || []} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.orderStatus || {}).map(([status, count]) => (
                <div key={status} className="space-y-2">
                  <div className="flex-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {status}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(count)}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${(count / (data.totals?.orders || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={data.recentActivities || []} />
        <TopProducts products={data.topSellingProducts || []} />
      </div>
    </div>
  );
};

export default Dashboard;
