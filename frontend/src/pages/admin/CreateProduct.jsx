import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui';
import { Button, Input, Textarea, Select, Checkbox, Badge, Skeleton } from '../../components/ui';
import { 
  Package, 
  DollarSign,
  Tag,
  Image,
  Plus,
  X,
  Trash2,
  Loader2
} from 'lucide-react';
import { apiCall, uploadMultipleFiles } from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';
import { formatPrice } from '../../utils/helpers';
import Toast from '../../components/ui/Toast';

const CreateProduct = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    brand: '',
    stock: '',
    colors: [],
    sizes: [],
    tags: [],
    featured: false,
    shipping: true,
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newTag, setNewTag] = useState('');

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

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and size
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        Toast.error(`File type ${file.type} is not supported`);
        return false;
      }
      
      if (file.size > maxSize) {
        Toast.error(`File ${file.name} is too large (max 5MB)`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      
      // Create previews
      const previews = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setImagePreviews(prev => [...prev, ...previews]);
    }
  }, []);

  // Remove image
  const removeImage = useCallback((index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Add color
  const addColor = useCallback(() => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()]
      }));
      setNewColor('');
    }
  }, [newColor, formData.colors]);

  // Remove color
  const removeColor = useCallback((color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  }, []);

  // Add size
  const addSize = useCallback(() => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()]
      }));
      setNewSize('');
    }
  }, [newSize, formData.sizes]);

  // Remove size
  const removeSize = useCallback((size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  }, []);

  // Add tag
  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  // Remove tag
  const removeTag = useCallback((tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      Toast.error('Product name is required');
      return;
    }
    
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      Toast.error('Valid price is required');
      return;
    }
    
    if (!formData.category) {
      Toast.error('Category is required');
      return;
    }
    
    if (!formData.stock || isNaN(formData.stock) || Number(formData.stock) < 0) {
      Toast.error('Valid stock quantity is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discount: Number(formData.discount) || 0,
        category: formData.category,
        brand: formData.brand,
        stock: Number(formData.stock),
        colors: formData.colors,
        sizes: formData.sizes,
        tags: formData.tags,
        featured: formData.featured,
        shipping: formData.shipping,
      };
      
      // Upload images and create product
      if (images.length > 0) {
        // Upload images first
        const imageData = await uploadMultipleFiles(
          API_ENDPOINTS.PRODUCTS.CREATE,
          images,
          'images',
          productData
        );
        
        Toast.success('Product created successfully');
        navigate('/admin/products');
      } else {
        // Create product without images
        const response = await apiCall('post', API_ENDPOINTS.PRODUCTS.CREATE, productData);
        Toast.success('Product created successfully');
        navigate('/admin/products');
      }
    } catch (err) {
      setError(err);
      Toast.error(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup image previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview.preview);
      });
    };
  }, [imagePreviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Product</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add a new product to your store
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            <Plus className="w-5 h-5 mr-2" />
            Create Product
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              label="Product Name"
              placeholder="Enter product name"
              leftIcon={Package}
              required
            />
            
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              label="Description"
              placeholder="Enter product description"
              rows={4}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                label="Brand"
                placeholder="Enter brand name"
                leftIcon={Tag}
              />
              
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                label="Category"
                placeholder="Select category"
                options={[
                  { value: '', label: 'Select category' },
                  ...categories.map(c => ({ value: c._id || c.id, label: c.name })),
                ]}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                label="Price"
                placeholder="Enter price"
                leftIcon={DollarSign}
                min="0"
                step="0.01"
                required
              />
              
              <Input
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleInputChange}
                label="Discount (%)"
                placeholder="Enter discount percentage"
                leftIcon={DollarSign}
                min="0"
                max="100"
                step="1"
              />
            </div>
            
            {formData.price && formData.discount && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discounted Price: {formatPrice(Number(formData.price) - (Number(formData.price) * Number(formData.discount) / 100))}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              label="Stock Quantity"
              placeholder="Enter stock quantity"
              min="0"
              step="1"
              required
            />
            
            <Checkbox
              name="shipping"
              checked={formData.shipping}
              onChange={handleInputChange}
              label="Free Shipping"
            />
            
            <Checkbox
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              label="Featured Product"
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-4">
                <Image className="w-12 h-12 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag & drop images here or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Supports: JPG, PNG, GIF, WEBP (Max 5MB per image)
                </p>
              </div>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={preview.preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attributes */}
        <Card>
          <CardHeader>
            <CardTitle>Product Attributes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Colors
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.colors.map((color) => (
                  <Badge key={color} variant="secondary" className="flex items-center gap-1">
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Add color"
                  className="flex-1"
                />
                <Button type="button" onClick={addColor} size="sm">
                  Add
                </Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sizes
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.sizes.map((size) => (
                  <Badge key={size} variant="secondary" className="flex items-center gap-1">
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Add size"
                  className="flex-1"
                />
                <Button type="button" onClick={addSize} size="sm">
                  Add
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            <Plus className="w-5 h-5 mr-2" />
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
