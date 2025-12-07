import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Filter,
  ChevronDown,
  Utensils,
  X,
  AlertTriangle,
  Save
} from 'lucide-react';
import {
  getMenuCategories,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../../api/restaurantOwnerApi';

function RestaurantOwnerMenuManagementPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [backendError, setBackendError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    image: '',
    isVeg: true,
    isPopular: false,
    preparationTime: 15
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategories, setShowCategories] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setBackendError('');

      console.log('📥 Loading menu data...');

      const [catRes, itemRes] = await Promise.all([
        getMenuCategories(),
        getMenuItems()
      ]);

      console.log('🔍 Categories response:', catRes);
      console.log('🔍 Items response:', itemRes);

      // ✅ Parse categories - FIXED VERSION
      let categoryMap = {}; // Name -> ID mapping
      let cats = [];

      if (catRes && catRes.success && Array.isArray(catRes.data)) {
        cats = catRes.data.map((c) => ({
          id: c._id,
          name: c.name
        }));

        // Create map for easy lookup
        cats.forEach(c => {
          categoryMap[c.name] = c.id;
        });

        setCategories(cats);
        console.log(`✅ Loaded ${cats.length} categories:`, cats);
      } else {
        console.warn('⚠️ Invalid categories response');
        setCategories([]);
      }

      // ✅ Parse items - FIXED VERSION
      if (itemRes && itemRes.success && Array.isArray(itemRes.data)) {
        const items = itemRes.data.map((item) => {
          // Handle both object (populated) and string (embedded) categories
          let catName = 'Uncategorized';
          let catId = '';

          if (item.category) {
            if (typeof item.category === 'object') {
              catName = item.category.name || 'Uncategorized';
              catId = item.category._id;
            } else {
              catName = item.category; // It's a string like "Main Course"
              // Try to find the ID from our map, otherwise leave empty or use name
              catId = categoryMap[catName] || '';
            }
          }

          return {
            id: item._id,
            name: item.name,
            price: item.price,
            categoryId: catId, // Used for Edit Form
            categoryName: catName, // Used for Grouping
            description: item.description || '',
            image: item.image || '',
            isVeg: item.isVeg !== undefined ? item.isVeg : true,
            isPopular: item.isPopular || false,
            preparationTime: item.preparationTime || 15
          };
        });

        setMenuItems(items);
        console.log(`✅ Loaded ${items.length} menu items`);
      } else {
        console.warn('⚠️ Invalid items response');
        setMenuItems([]);
      }

    } catch (err) {
      console.error('❌ loadData error:', err);
      setBackendError(err.message || 'Failed to load menu data');
      setCategories([]);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      categoryId: '',
      description: '',
      image: '',
      isVeg: true,
      isPopular: false,
      preparationTime: 15
    });
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      setBackendError('Please fill name, price, and category');
      return;
    }

    try {
      setSaving(true);
      setBackendError('');

      // ✅ FIXED: Get category name instead of ID
      const categoryName = categories.find(c => c.id === formData.categoryId)?.name || formData.categoryId;

      const data = new FormData();
      data.append('category', categoryName);
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('isVeg', formData.isVeg);
      data.append('isPopular', formData.isPopular);
      data.append('isAvailable', true);
      data.append('preparationTime', formData.preparationTime);

      if (formData.image instanceof File) {
        data.append('image', formData.image);
      } else if (formData.image && typeof formData.image === 'string') {
        // If it's a string (existing URL), we can send it or just let backend keep existing
        data.append('image', formData.image);
      }

      console.log('📤 Sending payload (FormData)');

      let result;
      if (editingItem) {
        result = await updateMenuItem(editingItem.id, data);
      } else {
        result = await createMenuItem(data);
      }

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to save menu item');
      }

      await loadData();
      resetForm();
      setIsAdding(false);
    } catch (err) {
      console.error('Error saving menu item:', err);
      setBackendError(err.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      categoryId: item.categoryId,
      description: item.description,
      image: item.image,
      isVeg: item.isVeg,
      isPopular: item.isPopular,
      preparationTime: item.preparationTime
    });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    try {
      setSaving(true);
      setBackendError('');

      const result = await deleteMenuItem(id);
      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to delete menu item');
      }

      setMenuItems(prev => prev.filter(item => item.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setBackendError(err.message || 'Failed to delete menu item');
    } finally {
      setSaving(false);
    }
  };

  // Filtering
  const categoryFilterOptions = ['All', ...categories.map(c => c.name)];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const cat = item.categoryName || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-orange-500 animate-spin border-t-transparent" />
          <p className="text-gray-600">Loading menu data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 mx-auto max-w-7xl min-h-screen md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 justify-between items-start mb-8 md:flex-row md:items-center">
        <div>
          <h1 className="flex gap-3 items-center text-3xl font-bold text-gray-800">
            <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <Utensils className="text-white" size={24} />
            </div>
            Menu Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your restaurant&apos;s menu items
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {

            resetForm();
            setIsAdding(true);
          }}
          className="flex gap-2 items-center px-4 py-2 text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-md disabled:opacity-50"
          disabled={saving}
        >
          <Plus size={20} />
          <span>Add Menu Item</span>
        </motion.button>
      </div>

      {/* Warning when no categories */}
      {/* {categories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 items-start p-4 mb-6 bg-yellow-50 rounded-xl border border-yellow-200"
        >
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-yellow-900">No Categories Found</h3>
            <p className="mb-3 text-sm text-yellow-800">
              You need to create menu categories before you can add menu items.
              Categories help organize your menu (e.g., "Appetizers", "Main Course", "Desserts").
            </p>
          </div>
        </motion.div>
      )} */}

      {/* Error message */}
      {backendError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 items-center px-4 py-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200"
        >
          <AlertTriangle className="flex-shrink-0 w-5 h-5" />
          <span>{backendError}</span>
          <button
            onClick={() => setBackendError('')}
            className="ml-auto text-red-700 hover:text-red-900"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <div className="flex items-center px-3 py-2 bg-white rounded-lg border">
            <Search className="mr-2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search dishes..."
              className="w-full outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex justify-between items-center px-3 py-2 w-full bg-white rounded-lg border"
            disabled={categories.length === 0}
          >
            <span>{selectedCategory}</span>
            <ChevronDown className="text-gray-400" size={20} />
          </button>

          <AnimatePresence>
            {showCategories && (
              <motion.div
                className="overflow-hidden absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {categoryFilterOptions.map((category) => (
                  <button
                    key={category}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedCategory === category ? 'bg-orange-50 text-orange-600' : ''
                      }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategories(false);
                    }}
                  >
                    {category}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Filters */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        >
          Clear Filters
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            className="overflow-hidden p-6 mb-8 bg-white rounded-2xl shadow-xl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => {
                  setIsAdding(false);
                  resetForm();
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="text-gray-500" size={24} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Item Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Paneer Butter Masala"
                  className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g. 250"
                  className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                  value={formData.price}
                  onChange={handleInputChange}
                  disabled={saving}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  disabled={saving || categories.length === 0}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preparation Time */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  disabled={saving}
                  min="1"
                />
              </div>

              {/* Description - Full Width */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe the dish..."
                  rows="3"
                  className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>

              {/* Image URL - Full Width */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Item Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 md:col-span-2">
                <label className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    name="isVeg"
                    checked={formData.isVeg}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Vegetarian</span>
                </label>

                <label className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={formData.isPopular}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Mark as Popular</span>
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {formData.image && (
              <div className="flex justify-center mt-4">
                <img
                  src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image}
                  alt="Preview"
                  className="object-cover w-32 h-32 rounded-lg border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 rounded-lg border disabled:opacity-50"
                onClick={() => {
                  setIsAdding(false);
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex gap-2 items-center px-5 py-2 text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg disabled:opacity-50"
                onClick={handleSubmit}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Items by Category */}
      <div className="space-y-6">
        {Object.keys(groupedItems).length === 0 && (
          <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl">
            <Utensils className="mb-4 text-orange-600" size={48} />
            <h3 className="mb-2 text-xl font-bold text-gray-800">
              No menu items found
            </h3>
            <p className="text-gray-600">
              {categories.length === 0
                ? 'Create categories first, then add menu items'
                : 'Click "Add Menu Item" to get started'}
            </p>
          </div>
        )}

        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">{category}</h2>
              <p className="text-sm text-gray-600">{items.length} items</p>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  className="p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                  whileHover={{ y: -2 }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover mb-3 w-full h-32 rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-600 rounded hover:bg-blue-50"
                        disabled={saving}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item)}
                        className="p-1 text-red-600 rounded hover:bg-red-50"
                        disabled={saving}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-bold text-orange-600">
                      ₹{item.price}
                    </span>
                    <div className="flex gap-2 items-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${item.isVeg
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                      {item.isPopular && (
                        <span className="px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className="p-6 w-full max-w-md bg-white rounded-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                Delete Menu Item?
              </h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RestaurantOwnerMenuManagementPage;
