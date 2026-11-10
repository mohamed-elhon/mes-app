import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Loader2,
  Save
} from 'lucide-react';
import { apiCall, uploadMultipleFiles } from '../../utils/api';
import { API_ENDPOINTS, API_UPLOADS_URL } from '../../utils/constants';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import Toast from '../../components/ui/Toast';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
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
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newTag, setNewTag] = useState('');

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await apiCall('get', API_ENDPOINTS.CATEGORIES.LIST, null, {
          params: { limit: 100 }
        });
        setCategories(categoriesResponse.data || []);
        
        // Fetch product
        const productResponse = await apiCall('get', API_ENDPOINTS.PRODUCTS.GET.replace(':id', id));
        const productData = productResponse.data.product || productResponse.data;
        
        setProduct(productData);
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price || '',
          discount: productData.discount || '',
          category: productData.category?._id || productData.category || '',
          brand: productData.brand || '',
          stock: productData.stock || '',
          colors: productData.colors || [],
          sizes: productData.sizes || [],
          tags: productData.tags || [],
          featured: productData.featured || false,
          shipping: productData.shipping !== undefined ? productData.shipping : true,
        });
        
        // Set existing images
        if (productData.images && productData.images.length > 0) {
          setExistingImages(productData.images);
        }
        
        setError(null);
      } catch (err) {
        setError(err);
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

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
        preview: URL.createObjectURL(file),
        isNew: true
      }));
      
      setImagePreviews(prev => [...prev, ...previews]);
    }
  }, []);

  // Remove image
  const removeImage = useCallback((index, isNew = true) => {
    if (isNew) {
      setImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove existing image
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
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
      setSubmitting(true);
      
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
      
      // Upload images and update product
      if (images.length > 0 || existingImages.length !== product.images?.length) {
        // Use the update endpoint with images
        const updateData = new FormData();
        
        // Append product data
        Object.keys(productData).forEach(key => {
          updateData.append(key, productData[key]);
        });
        
        // Append new images
        images.forEach(image => {
          updateData.append('images', image);
        });
        
        // Append existing images (to keep them)
        existingImages.forEach(img => {
          updateData.append('existingImages', img.public_id || img.url);
        });
        
        await apiCall('put', API_ENDPOINTS.PRODUCTS.UPDATE.replace(':id', id), updateData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Update without images
        await apiCall('put', API_ENDPOINTS.PRODUCTS.UPDATE.replace(':id', id), productData);
      }
      
      Toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (err) {
      setError(err);
      Toast.error(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  // Cleanup image previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.isNew) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, [imagePreviews]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height="40px" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height="50px" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600 mb-4">Failed to load product</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Combine existing and new images for preview
  const allImages = [
    ...existingImages.map(img => ({
      url: getImageUrl(img.url),
      public_id: img.public_id,
      isNew: false
    })),
    ...imagePreviews.filter(p => p.isNew)
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update your product information
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            <Save className="w-5 h-5 mr-2" />
            Save Changes
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
                  Original: {formatPrice(Number(formData.price))} → 
                  Discounted: {formatPrice(Number(formData.price) - (Number(formData.price) * Number(formData.discount) / 100))}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
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
            
            {allImages.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {allImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={img.preview || img.url} 
                      alt={`Product image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.isNew ? index : index - images.length, !img.isNew)}
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
          <Button onClick={handleSubmit} loading={submitting}>
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
