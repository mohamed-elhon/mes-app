import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui';
import { Button, Input, Select, Badge, Pagination, Skeleton, EmptyState, Dropdown, DropdownItem, DropdownMenu, DropdownDivider } from '../../components/ui';
import { 
  Package, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { apiCall, apiPaginatedCall } from '../../utils/api';
import { API_ENDPOINTS, PRODUCTS_PER_PAGE } from '../../utils/constants';
import { formatPrice, formatDate, truncateText, getImageUrl } from '../../utils/helpers';
import Toast from '../../components/ui/Toast';

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PRODUCTS_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiCall('get', API_ENDPOINTS.CATEGORIES.LIST, null, {
          params: { limit: 100 }
        });
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page,
        limit,
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        sortBy,
        sortOrder,
        ...(statusFilter && { featured: statusFilter === 'featured' }),
      };
      
      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      const response = await apiPaginatedCall(API_ENDPOINTS.PRODUCTS.LIST, params);
      setProducts(response.data || []);
      setTotal(response.pagination?.total || 0);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Fetch products on mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Handle filter change
  const handleFilterChange = (filter, value) => {
    if (filter === 'category') {
      setCategoryFilter(value);
    } else if (filter === 'status') {
      setStatusFilter(value);
    }
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSearchParams({ page: newPage });
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Handle delete product
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiCall('delete', API_ENDPOINTS.PRODUCTS.DELETE.replace(':id', productId));
        Toast.success('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        Toast.error(err.message || 'Failed to delete product');
      }
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedProducts.length === 0) {
      Toast.warning('Please select at least one product');
      return;
    }
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
          // TODO: Implement bulk delete
          Toast.info('Bulk delete feature coming soon');
        }
        break;
      case 'featured':
        // TODO: Implement bulk featured
        Toast.info('Bulk featured feature coming soon');
        break;
      default:
        break;
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle all products selection
  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id || p.id));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your store products
          </p>
        </div>
        
        <Button onClick={() => navigate('/admin/products/create')}>
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
              className="md:col-span-2 lg:col-span-1"
            />
            
            <Select
              value={categoryFilter}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              placeholder="All Categories"
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(c => ({ value: c._id || c.id, label: c.name })),
              ]}
            />
            
            <Select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              placeholder="All Status"
              options={[
                { value: '', label: 'All Status' },
                { value: 'featured', label: 'Featured' },
                { value: 'normal', label: 'Normal' },
              ]}
            />
            
            <div className="flex items-center gap-2">
              <Button type="submit" variant="secondary" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters} className="px-3">
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedProducts.length} products selected
          </span>
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('featured')}>
              Featured
            </Button>
            <Button variant="error" size="sm" onClick={() => handleBulkAction('delete')}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="60px" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-error-600 mb-4">Failed to load products</p>
              <Button onClick={fetchProducts}>Retry</Button>
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              type="products"
              action={{ onClick: () => navigate('/admin/products/create') }}
            />
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <Checkbox
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={toggleAllProducts}
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSortChange('name')}
                          className="flex items-center gap-1 hover:text-primary-600 transition-colors duration-200"
                        >
                          Product
                          {sortBy === 'name' && (
                            sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSortChange('category')}
                          className="flex items-center gap-1 hover:text-primary-600 transition-colors duration-200"
                        >
                          Category
                          {sortBy === 'category' && (
                            sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSortChange('price')}
                          className="flex items-center gap-1 hover:text-primary-600 transition-colors duration-200"
                        >
                          Price
                          {sortBy === 'price' && (
                            sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSortChange('stock')}
                          className="flex items-center gap-1 hover:text-primary-600 transition-colors duration-200"
                        >
                          Stock
                          {sortBy === 'stock' && (
                            sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button 
                          onClick={() => handleSortChange('createdAt')}
                          className="flex items-center gap-1 hover:text-primary-600 transition-colors duration-200"
                        >
                          Date
                          {sortBy === 'createdAt' && (
                            sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => (
                      <tr key={product._id || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={selectedProducts.includes(product._id || product.id)}
                            onChange={() => toggleProductSelection(product._id || product.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                              {product.images?.[0]?.url && (
                                <img 
                                  src={getImageUrl(product.images[0].url)} 
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {product.sku}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {product.category?.name || 'Uncategorized'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {product.discount > 0 && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(product.price)}
                              </span>
                            )}
                            <span className={`text-sm font-medium ${product.discount > 0 ? 'text-success' : 'text-gray-900 dark:text-white'}`}>
                              {formatPrice(product.price - (product.price * product.discount / 100))}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={product.stock > 50 ? 'success' : product.stock > 0 ? 'warning' : 'error'}>
                            {product.stock}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(product.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Dropdown
                            trigger={<button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>}
                          >
                            <DropdownMenu>
                              <DropdownItem 
                                onClick={() => navigate(`/admin/products/edit/${product._id || product.id}`)}
                                icon={Edit}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem 
                                onClick={() => navigate(`/products/${product._id || product.id}`)}
                                icon={Eye}
                              >
                                View
                              </DropdownItem>
                              <DropdownDivider />
                              <DropdownItem 
                                onClick={() => handleDelete(product._id || product.id)}
                                className="text-error"
                                icon={Trash2}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <CardFooter>
                <div className="flex-between w-full">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {products.length} of {total} products
                  </p>
                  <Pagination
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={handlePageChange}
                    showPageSizeChanger
                    pageSizeOptions={[10, 20, 30, 50, 100]}
                    onLimitChange={handleLimitChange}
                  />
                </div>
              </CardFooter>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
