import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Search from './pages/Search';
import TagProducts from './pages/TagProducts';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// User Pages
import Profile from './pages/user/Profile';
import MyOrders from './pages/user/MyOrders';
import OrderDetail from './pages/user/OrderDetail';
import Wishlist from './pages/user/Wishlist';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import OrderSuccess from './pages/user/OrderSuccess';
import OrderFailed from './pages/user/OrderFailed';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCreateProduct from './pages/admin/CreateProduct';
import AdminEditProduct from './pages/admin/EditProduct';
import AdminCategories from './pages/admin/Categories';
import AdminCreateCategory from './pages/admin/CreateCategory';
import AdminEditCategory from './pages/admin/EditCategory';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminUsers from './pages/admin/Users';
import AdminCreateUser from './pages/admin/CreateUser';
import AdminEditUser from './pages/admin/EditUser';
import AdminCoupons from './pages/admin/Coupons';
import AdminCreateCoupon from './pages/admin/CreateCoupon';
import AdminEditCoupon from './pages/admin/EditCoupon';
import AdminReviews from './pages/admin/Reviews';
import AdminContacts from './pages/admin/Contacts';
import AdminSettings from './pages/admin/Settings';

// Not Found
import NotFound from './pages/NotFound';

// Protected Routes
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import PublicRoute from './components/auth/PublicRoute';

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            {/* Home */}
            <Route index element={<Home />} />
            
            {/* Products */}
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="products/category/:slug" element={<CategoryProducts />} />
            <Route path="products/tag/:tag" element={<TagProducts />} />
            <Route path="search" element={<Search />} />
            
            {/* Categories */}
            <Route path="categories" element={<Categories />} />
            
            {/* Pages */}
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            
            {/* Auth */}
            <Route element={<PublicRoute />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="verify-email" element={<VerifyEmail />} />
            </Route>
            
            {/* User */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success" element={<OrderSuccess />} />
              <Route path="order-failed" element={<OrderFailed />} />
            </Route>
            
            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route element={<AdminRoute />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              
              {/* Products */}
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/create" element={<AdminCreateProduct />} />
              <Route path="products/edit/:id" element={<AdminEditProduct />} />
              
              {/* Categories */}
              <Route path="categories" element={<AdminCategories />} />
              <Route path="categories/create" element={<AdminCreateCategory />} />
              <Route path="categories/edit/:id" element={<AdminEditCategory />} />
              
              {/* Orders */}
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              
              {/* Users */}
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/create" element={<AdminCreateUser />} />
              <Route path="users/edit/:id" element={<AdminEditUser />} />
              
              {/* Coupons */}
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="coupons/create" element={<AdminCreateCoupon />} />
              <Route path="coupons/edit/:id" element={<AdminEditCoupon />} />
              
              {/* Reviews */}
              <Route path="reviews" element={<AdminReviews />} />
              
              {/* Contacts */}
              <Route path="contacts" element={<AdminContacts />} />
              
              {/* Settings */}
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
