# E-commerce Store - Full Application

A complete e-commerce application with a main website and admin dashboard built with MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Features

### Main Website
- **User Authentication**: Login, Register, Forgot Password, Reset Password, Email Verification
- **Product Management**: Browse products, search, filter, categories, tags
- **Shopping Cart**: Add/remove items, update quantities, apply coupons
- **Wishlist**: Save favorite products
- **Orders**: Place orders, track order status, order history
- **Reviews & Ratings**: Submit product reviews
- **Payment**: Stripe integration, multiple payment methods
- **Responsive Design**: Works on all devices

### Admin Dashboard
- **Dashboard**: Overview statistics, charts, recent activities
- **Products**: CRUD operations, bulk actions, image uploads
- **Categories**: Hierarchical categories, image support
- **Orders**: Manage orders, update status, track shipments
- **Users**: User management, roles, permissions
- **Coupons**: Create and manage discount coupons
- **Reviews**: Approve/disapprove reviews
- **Contacts**: Manage customer inquiries
- **Settings**: Store configuration

## 📁 Project Structure

```
ecommerce-app/
├── backend/                 # Node.js + Express API
│   ├── config/              # Configuration files
│   ├── controllers/          # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Main server file
│
├── frontend/               # Main website (React)
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── product/     # Product components
│   │   │   ├── ui/          # UI components
│   │   │   └── ...
│   │   ├── context/         # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── auth/        # Auth pages
│   │   │   ├── user/        # User pages
│   │   │   └── ...
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── admin/                  # Admin dashboard (React)
│   ├── src/                # Similar structure to frontend
│   └── package.json
│
└── README.md
```

## 🛠️ Technologies Used

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Cloudinary**: Image storage
- **Stripe**: Payment processing
- **Nodemailer**: Email sending
- **Multer**: File uploads

### Frontend
- **React**: JavaScript library
- **React Router**: Routing
- **Tailwind CSS**: Styling
- **Vite**: Build tool
- **Framer Motion**: Animations
- **React Hot Toast**: Notifications
- **Formik + Yup**: Form validation
- **Zustand**: State management
- **Lucide React**: Icons
- **Recharts**: Charts
- **Axios**: HTTP requests

## 🏃 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd ecommerce-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ecommerce-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_UPLOADS_URL=http://localhost:5000/uploads
```

4. Start the development server:
```bash
npm run dev
```

### Admin Setup

1. Navigate to the admin directory:
```bash
cd ecommerce-app/admin
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_UPLOADS_URL=http://localhost:5000/uploads
```

4. Start the development server:
```bash
npm run dev
```

## 🌐 Access the Application

- **Main Website**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **API**: http://localhost:5000/api

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/update-password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/best-selling` - Get best selling products
- `GET /api/products/new-arrivals` - Get new arrivals
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/hierarchy` - Get hierarchical categories
- `GET /api/categories/:slug` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/create-checkout-session` - Create Stripe checkout

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `POST /api/cart/apply-coupon` - Apply coupon

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove` - Remove from wishlist
- `GET /api/wishlist/check/:productId` - Check if in wishlist

### Reviews
- `GET /api/reviews/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark as helpful

### Coupons
- `GET /api/coupons` - Get all coupons (Admin)
- `POST /api/coupons` - Create coupon (Admin)
- `PUT /api/coupons/:id` - Update coupon (Admin)
- `DELETE /api/coupons/:id` - Delete coupon (Admin)
- `POST /api/coupons/validate` - Validate coupon

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Admin)
- `GET /api/dashboard/charts` - Get charts data (Admin)
- `GET /api/dashboard/activities` - Get recent activities (Admin)

### Contact
- `POST /api/contact` - Create contact message
- `GET /api/contact` - Get all contacts (Admin)
- `PUT /api/contact/:id/read` - Mark as read (Admin)
- `PUT /api/contact/:id/resolve` - Mark as resolved (Admin)

## 👥 User Roles

- **Admin**: Full access to all features
- **User**: Can browse products, add to cart, place orders, leave reviews

## 🎨 Customization

### Theming
- Modify colors in `tailwind.config.js`
- Update styles in `src/index.css`

### Branding
- Update site name and logo in `src/utils/constants.js`
- Replace favicon in `public/favicon.svg`

### Features
- Enable/disable features by modifying the corresponding routes and components
- Customize validation rules in `src/utils/validator.js`

## 🚀 Deployment

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run build
npm run preview
```

## 📄 License

MIT License

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Coding! 🎉**
