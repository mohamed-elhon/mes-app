const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Contact = require('../models/Contact');
const asyncHandler = require('../middleware/async');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  // Total counts
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalCategories = await Category.countDocuments();
  const totalReviews = await Review.countDocuments();
  const totalCoupons = await Coupon.countDocuments();
  const totalContacts = await Contact.countDocuments();
  
  // Recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('firstName lastName email createdAt');
  
  // Recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'firstName lastName')
    .select('user totalPrice orderStatus createdAt');
  
  // Recent products
  const recentProducts = await Product.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name price stock sold createdAt');
  
  // Sales overview
  const salesOverview = await Order.aggregate([
    { $group: {
      _id: null,
      totalRevenue: { $sum: '$totalPrice' },
      totalOrders: { $sum: 1 },
      averageOrderValue: { $avg: '$totalPrice' },
      totalItemsSold: { $sum: '$totalItems' }
    }}
  ]);
  
  // Top selling products
  const topSellingProducts = await Product.find()
    .sort({ sold: -1 })
    .limit(5)
    .select('name price sold stock');
  
  // Top categories by sales
  const topCategories = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $group: {
      _id: '$orderItems.product',
      totalSold: { $sum: '$orderItems.quantity' }
    }},
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    { $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: '_id',
      as: 'product'
    }},
    { $unwind: '$product' },
    { $lookup: {
      from: 'categories',
      localField: 'product.category',
      foreignField: '_id',
      as: 'category'
    }},
    { $unwind: '$category' },
    { $group: {
      _id: '$category._id',
      name: { $first: '$category.name' },
      totalSold: { $sum: '$totalSold' }
    }},
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);
  
  // Monthly sales
  const monthlySales = await Order.aggregate([
    { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      totalSales: { $sum: '$totalPrice' },
      totalOrders: { $sum: 1 }
    }},
    { $sort: { _id: 1 } },
    { $limit: 12 }
  ]);
  
  // User growth
  const userGrowth = await User.aggregate([
    { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } },
    { $limit: 12 }
  ]);
  
  // Order status distribution
  const orderStatus = await Order.aggregate([
    { $group: {
      _id: '$orderStatus',
      count: { $sum: 1 }
    }}
  ]);
  
  // Payment method distribution
  const paymentMethods = await Order.aggregate([
    { $group: {
      _id: '$paymentMethod',
      count: { $sum: 1 }
    }}
  ]);
  
  // Low stock products
  const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
    .sort({ stock: 1 })
    .limit(10)
    .select('name stock');
  
  res.status(200).json({
    success: true,
    data: {
      totals: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        categories: totalCategories,
        reviews: totalReviews,
        coupons: totalCoupons,
        contacts: totalContacts
      },
      salesOverview: salesOverview[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalItemsSold: 0
      },
      recentUsers,
      recentOrders,
      recentProducts,
      topSellingProducts,
      topCategories,
      monthlySales,
      userGrowth,
      orderStatus: orderStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      paymentMethods: paymentMethods.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      lowStockProducts
    }
  });
});

// @desc    Get dashboard charts data
// @route   GET /api/dashboard/charts
// @access  Private/Admin
exports.getChartsData = asyncHandler(async (req, res, next) => {
  const { type, period } = req.query;
  
  let data = {};
  
  switch (type) {
    case 'sales':
      // Sales over time
      const salesData = await Order.aggregate([
        { $group: {
          _id: period === 'daily' 
            ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            : period === 'weekly'
              ? { $dateToString: { format: '%Y-%U', date: '$createdAt' } }
              : { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalSales: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]);
      
      data = {
        labels: salesData.map(d => d._id),
        datasets: [
          {
            label: 'Sales',
            data: salesData.map(d => d.totalSales),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }
        ]
      };
      break;
    
    case 'users':
      // User growth over time
      const userData = await User.aggregate([
        { $group: {
          _id: period === 'daily' 
            ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            : period === 'weekly'
              ? { $dateToString: { format: '%Y-%U', date: '$createdAt' } }
              : { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]);
      
      data = {
        labels: userData.map(d => d._id),
        datasets: [
          {
            label: 'Users',
            data: userData.map(d => d.count),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          }
        ]
      };
      break;
    
    case 'products':
      // Product distribution by category
      const productData = await Product.aggregate([
        { $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }},
        { $unwind: '$category' },
        { $group: {
          _id: '$category.name',
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } }
      ]);
      
      data = {
        labels: productData.map(d => d._id),
        datasets: [
          {
            label: 'Products',
            data: productData.map(d => d.count),
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
              '#06b6d4', '#eab308', '#ec4899', '#14b8a6', '#f97316'
            ]
          }
        ]
      };
      break;
    
    case 'orders':
      // Order status distribution
      const orderData = await Order.aggregate([
        { $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }}
      ]);
      
      data = {
        labels: orderData.map(d => d._id),
        datasets: [
          {
            label: 'Orders',
            data: orderData.map(d => d.count),
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
            ]
          }
        ]
      };
      break;
    
    default:
      data = { labels: [], datasets: [] };
  }
  
  res.status(200).json({
    success: true,
    data
  });
});

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private/Admin
exports.getActivities = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  // Get recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('user', 'firstName lastName email')
    .select('user totalPrice orderStatus createdAt paymentMethod');
  
  // Get recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select('firstName lastName email role createdAt');
  
  // Get recent reviews
  const recentReviews = await Review.find()
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('user', 'firstName lastName')
    .populate('product', 'name')
    .select('user product rating comment createdAt isApproved');
  
  // Get recent contacts
  const recentContacts = await Contact.find()
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select('name email subject isRead createdAt');
  
  // Combine and sort by date
  const activities = [
    ...recentOrders.map(order => ({
      type: 'order',
      data: order,
      date: order.createdAt,
      message: `New order #${order._id} from ${order.user.firstName} ${order.user.lastName}`
    })),
    ...recentUsers.map(user => ({
      type: 'user',
      data: user,
      date: user.createdAt,
      message: `New user registered: ${user.firstName} ${user.lastName}`
    })),
    ...recentReviews.map(review => ({
      type: 'review',
      data: review,
      date: review.createdAt,
      message: `New review for ${review.product.name} by ${review.user.firstName}`
    })),
    ...recentContacts.map(contact => ({
      type: 'contact',
      data: contact,
      date: contact.createdAt,
      message: `New contact message from ${contact.name}`
    }))
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, Number(limit));
  
  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities
  });
});

// @desc    Get system notifications
// @route   GET /api/dashboard/notifications
// @access  Private/Admin
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  // Low stock notifications
  const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
    .sort({ stock: 1 })
    .limit(5)
    .select('name stock');
  
  // Pending orders
  const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
  
  // Unread contacts
  const unreadContacts = await Contact.countDocuments({ isRead: false });
  
  // Unapproved reviews
  const unapprovedReviews = await Review.countDocuments({ isApproved: false });
  
  // Expired coupons
  const expiredCoupons = await Coupon.find({
    endDate: { $lt: new Date() },
    isActive: true
  })
    .sort({ endDate: 1 })
    .limit(5)
    .select('code endDate');
  
  // New users today
  const newUsersToday = await User.countDocuments({
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
  });
  
  // New orders today
  const newOrdersToday = await Order.countDocuments({
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
  });
  
  // Today's revenue
  const todaysRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  
  const notifications = [
    {
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${lowStockProducts.length} products have low stock`,
      count: lowStockProducts.length,
      data: lowStockProducts
    },
    {
      type: 'pending_orders',
      title: 'Pending Orders',
      message: `${pendingOrders} orders are pending`,
      count: pendingOrders
    },
    {
      type: 'unread_contacts',
      title: 'Unread Messages',
      message: `${unreadContacts} contact messages are unread`,
      count: unreadContacts
    },
    {
      type: 'unapproved_reviews',
      title: 'Pending Reviews',
      message: `${unapprovedReviews} reviews are waiting for approval`,
      count: unapprovedReviews
    },
    {
      type: 'expired_coupons',
      title: 'Expired Coupons',
      message: `${expiredCoupons.length} coupons have expired`,
      count: expiredCoupons.length,
      data: expiredCoupons
    },
    {
      type: 'new_users',
      title: 'New Users Today',
      message: `${newUsersToday} new users registered today`,
      count: newUsersToday
    },
    {
      type: 'new_orders',
      title: 'New Orders Today',
      message: `${newOrdersToday} new orders placed today`,
      count: newOrdersToday
    },
    {
      type: 'revenue',
      title: "Today's Revenue",
      message: `Revenue: $${todaysRevenue[0]?.total?.toFixed(2) || 0}`,
      data: { revenue: todaysRevenue[0]?.total || 0 }
    }
  ]
    .filter(n => n.count > 0 || n.data)
    .sort((a, b) => b.count - a.count);
  
  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/dashboard/notifications/:type/read
// @access  Private/Admin
exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  
  switch (type) {
    case 'unread_contacts':
      await Contact.updateMany({ isRead: false }, { isRead: true });
      break;
    case 'unapproved_reviews':
      await Review.updateMany({ isApproved: false }, { isApproved: true });
      break;
    case 'expired_coupons':
      await Coupon.updateMany(
        { endDate: { $lt: new Date() }, isActive: true },
        { isActive: false }
      );
      break;
    default:
      return next(new ErrorResponse('Invalid notification type', 400));
  }
  
  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private/Admin
exports.getSummary = asyncHandler(async (req, res, next) => {
  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
  const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
  const todayRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  
  // This week's stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekUsers = await User.countDocuments({ createdAt: { $gte: weekStart } });
  const weekOrders = await Order.countDocuments({ createdAt: { $gte: weekStart } });
  const weekRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: weekStart } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  
  // This month's stats
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const monthUsers = await User.countDocuments({ createdAt: { $gte: monthStart } });
  const monthOrders = await Order.countDocuments({ createdAt: { $gte: monthStart } });
  const monthRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: monthStart } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  
  // Growth rates
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const lastWeekUsers = await User.countDocuments({
    createdAt: { $gte: lastWeekStart, $lt: weekStart }
  });
  const lastWeekOrders = await Order.countDocuments({
    createdAt: { $gte: lastWeekStart, $lt: weekStart }
  });
  const lastWeekRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: lastWeekStart, $lt: weekStart } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  
  const userGrowth = lastWeekUsers > 0 ? 
    ((weekUsers - lastWeekUsers) / lastWeekUsers * 100).toFixed(2) : 0;
  const orderGrowth = lastWeekOrders > 0 ? 
    ((weekOrders - lastWeekOrders) / lastWeekOrders * 100).toFixed(2) : 0;
  const revenueGrowth = lastWeekRevenue[0]?.total > 0 ? 
    ((weekRevenue[0]?.total - lastWeekRevenue[0]?.total) / lastWeekRevenue[0]?.total * 100).toFixed(2) : 0;
  
  // Top performing categories
  const topCategories = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $lookup: {
      from: 'products',
      localField: 'orderItems.product',
      foreignField: '_id',
      as: 'product'
    }},
    { $unwind: '$product' },
    { $lookup: {
      from: 'categories',
      localField: 'product.category',
      foreignField: '_id',
      as: 'category'
    }},
    { $unwind: '$category' },
    { $group: {
      _id: '$category._id',
      name: { $first: '$category.name' },
      sales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      orders: { $sum: 1 }
    }},
    { $sort: { sales: -1 } },
    { $limit: 3 }
  ]);
  
  // Top selling products
  const topProducts = await Product.find()
    .sort({ sold: -1 })
    .limit(3)
    .select('name sold price');
  
  res.status(200).json({
    success: true,
    data: {
      today: {
        users: todayUsers,
        orders: todayOrders,
        revenue: todayRevenue[0]?.total || 0
      },
      week: {
        users: weekUsers,
        orders: weekOrders,
        revenue: weekRevenue[0]?.total || 0,
        userGrowth,
        orderGrowth,
        revenueGrowth
      },
      month: {
        users: monthUsers,
        orders: monthOrders,
        revenue: monthRevenue[0]?.total || 0
      },
      topCategories,
      topProducts
    }
  });
});

// @desc    Export dashboard data
// @route   GET /api/dashboard/export
// @access  Private/Admin
exports.exportData = asyncHandler(async (req, res, next) => {
  const { type, format = 'json' } = req.query;
  
  let data = [];
  let filename = '';
  
  switch (type) {
    case 'users':
      data = await User.find()
        .sort({ createdAt: -1 })
        .select('firstName lastName email phone role createdAt');
      filename = 'users';
      break;
    
    case 'products':
      data = await Product.find()
        .sort({ createdAt: -1 })
        .populate('category', 'name')
        .select('name price stock sold category createdAt');
      filename = 'products';
      break;
    
    case 'orders':
      data = await Order.find()
        .sort({ createdAt: -1 })
        .populate('user', 'firstName lastName email')
        .select('user totalPrice orderStatus paymentMethod createdAt');
      filename = 'orders';
      break;
    
    case 'reviews':
      data = await Review.find()
        .sort({ createdAt: -1 })
        .populate('user', 'firstName lastName')
        .populate('product', 'name')
        .select('user product rating comment createdAt');
      filename = 'reviews';
      break;
    
    default:
      return next(new ErrorResponse('Invalid export type', 400));
  }
  
  // Format response based on format
  if (format === 'csv') {
    // Convert to CSV
    if (data.length === 0) {
      return res.status(200).json({ success: true, message: 'No data to export' });
    }
    
    const headers = Object.keys(data[0].toObject());
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const item of data) {
      const values = headers.map(header => {
        const value = item[header];
        if (value && typeof value === 'object' && value._id) {
          return value.name || value.toString();
        }
        return value ? value.toString().replace(/,/g, '') : '';
      });
      csvRows.push(values.join(','));
    }
    
    const csv = csvRows.join('\n');
    
    res.header('Content-Type', 'text/csv');
    res.attachment(`${filename}.csv`);
    return res.send(csv);
  }
  
  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});
