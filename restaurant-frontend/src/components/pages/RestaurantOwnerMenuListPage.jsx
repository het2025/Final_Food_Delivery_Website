import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Star,
  ChefHat
} from 'lucide-react';
import { getMenuCategories, getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../api/restaurantOwnerApi';  // Full imports for CRUD

function RestaurantOwnerMenuListPage() {  // Renamed for consistency
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [items, setItems] = useState([]);  // Loaded from backend
  const [categories, setCategories] = useState(['All']);  // Filter options (names)

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Controlled forms
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    price: '',
    status: 'active',
    description: ''
  });

  const [editItem, setEditItem] = useState({
    name: '',
    category: '',
    price: '',
    status: 'active',
    description: ''
  });

  const [backendError, setBackendError] = useState('');
  const [loading, setLoading] = useState(true);
  const [crudLoading, setCrudLoading] = useState(false);  // For add/edit/delete

  // ---------- NEW: Quick Add Category state ----------
  const [newCategoryName, setNewCategoryName] = useState('');
  // ---------------------------------------------------

  // Reusable fetchCategories so we can refresh after creating a category
  const fetchCategories = async () => {
    try {
      const catJson = await getMenuCategories();
      if (catJson.success && catJson.data) {
        const catNames = catJson.data.map((c) => c.name).filter(Boolean) || [];
        setCategories(['All', ...catNames]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Load data from backend on mount (fixed for API structure)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setBackendError('');

        // 1. Categories
        await fetchCategories();

        // 2. Items
        const itemJson = await getMenuItems();
        if (itemJson.success && itemJson.data) {
          const mapped = itemJson.data.map((item) => ({
            id: item._id,
            name: item.name,
            category:
              typeof item.categoryId === 'object'
                ? item.categoryId.name
                : item.category?.name || 'Uncategorized',  // Fixed: Handle category object or ref
            price: `₹${Number(item.price || 0).toFixed(2)}`,  // Fixed: Ensure number
            status: item.isAvailable ? 'active' : 'inactive',  // Fixed: Backend boolean
            description: item.description || ''
          })) || [];
          setItems(mapped);
        }
      } catch (err) {
        console.error('Restaurant owner menu data load error:', err);  // Renamed log
        setBackendError(err.message || 'Failed to load restaurant owner menu list');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh items after CRUD
  const refreshItems = async () => {
    const itemJson = await getMenuItems();
    if (itemJson.success && itemJson.data) {
      const mapped = itemJson.data.map((item) => ({
        id: item._id,
        name: item.name,
        category:
          typeof item.categoryId === 'object'
            ? item.categoryId.name
            : item.category?.name || 'Uncategorized',
        price: `₹${Number(item.price || 0).toFixed(2)}`,
        status: item.isAvailable ? 'active' : 'inactive',
        description: item.description || ''
      })) || [];
      setItems(mapped);
    }
  };

  // Stats (computed from items)
  const totalItems = items.length;
  const activeItems = items.filter((i) => i.status === 'active').length;
  const uniqueCategories = new Set(items.map((i) => i.category)).size;

  const menuStats = [
    { label: 'Total Items', value: String(totalItems), icon: Utensils, change: 0 },
    { label: 'Active Items', value: String(activeItems), icon: ChefHat, change: 0 },
    {
      label: 'Categories',
      value: String(uniqueCategories),
      icon: Star,
      change: 0
    },
    { label: 'New This Month', value: '0', icon: Plus, change: 0 }
  ];

  // UI handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    // Better validation with specific messages
    if (!newItem.name) {
      setBackendError('Please enter dish name');
      return;
    }
    
    if (!newItem.category || newItem.category === '') {
      setBackendError('Please select a category');
      return;
    }
    
    if (!newItem.price) {
      setBackendError('Please enter price');
      return;
    }
    
    if (!newItem.description) {
      setBackendError('Please enter description');
      return;
    }

    setCrudLoading(true);
    setBackendError('');

    try {
      // Parse price (remove ₹, ensure number)
      const priceNum = parseFloat(newItem.price.replace('₹', '')) || 0;
      const payload = {
        name: newItem.name,
        category: newItem.category,  // Backend finds ID by name or adjust to pass categoryId
        price: priceNum,
        description: newItem.description,
        isAvailable: newItem.status === 'active'
      };

      const res = await createMenuItem(payload);
      if (res.success) {
        await refreshItems();  // Reload from backend
        setShowAddModal(false);
        setNewItem({
          name: '',
          category: '',
          price: '',
          status: 'active',
          description: ''
        });
      } else {
        setBackendError(res.message || 'Failed to add item');
      }
    } catch (err) {
      setBackendError(err.message || 'Failed to add menu item');
    } finally {
      setCrudLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editItem.name || !editItem.category || !editItem.price || !editItem.description) return;

    setCrudLoading(true);
    setBackendError('');

    try {
      const priceNum = parseFloat(editItem.price.replace('₹', '')) || 0;
      const payload = {
        name: editItem.name,
        category: editItem.category,
        price: priceNum,
        description: editItem.description,
        isAvailable: editItem.status === 'active'
      };

      const res = await updateMenuItem(selectedItem.id, payload);
      if (res.success) {
        await refreshItems();
        setShowEditModal(false);
        setSelectedItem(null);
        setEditItem({
          name: '',
          category: '',
          price: '',
          status: 'active',
          description: ''
        });
      } else {
        setBackendError(res.message || 'Failed to update item');
      }
    } catch (err) {
      setBackendError(err.message || 'Failed to update menu item');
    } finally {
      setCrudLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    setCrudLoading(true);
    setBackendError('');

    try {
      const res = await deleteMenuItem(selectedItem.id);
      if (res.success) {
        await refreshItems();
        setShowDeleteModal(false);
        setSelectedItem(null);
      } else {
        setBackendError(res.message || 'Failed to delete item');
      }
    } catch (err) {
      setBackendError(err.message || 'Failed to delete menu item');
    } finally {
      setCrudLoading(false);
    }
  };

  // ---------- NEW: Quick Add Category handler ----------
  const handleQuickAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const nameToCreate = newCategoryName.trim();

    try {
      const token = localStorage.getItem('restaurantOwnerToken') || localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/menu/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: nameToCreate,
          description: '',
          sortOrder: categories.length
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh categories
        await fetchCategories();
        setNewCategoryName('');
        alert(`Category "${nameToCreate}" created successfully!`);
      } else {
        alert(data.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    }
  };
  // ----------------------------------------------------

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term);
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const Icon = statusConfig[status]?.icon || AlertCircle;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
          statusConfig[status]?.color || 'bg-gray-100 text-gray-800'
        }`}
      >
        <Icon size={12} />
        {status}
      </span>
    );
  };

  // Tabs
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {menuStats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <div
              key={stat.label}
              className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <h3 className="mt-1 text-2xl font-bold">{stat.value}</h3>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              {stat.change !== 0 && (
                <div
                  className={`flex items-center mt-4 text-sm ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {stat.change} this month
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Menu Items */}
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">Recent Menu Items</h2>
        <div className="space-y-4">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50"
            >
              <div className="flex gap-3 items-center">
                <div className="flex justify-center items-center w-10 h-10 font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
                  <Utensils size={16} />
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{item.price}</p>
                {renderStatusBadge(item.status)}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-gray-500">
              No items yet. Add dishes from the list below.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const ListTab = () => (
    <div className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex flex-col gap-4 justify-between items-start p-5 border-b border-gray-200 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold">All Menu Items</h2>
        <div className="flex gap-3 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search restaurant menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pr-4 pl-9 w-full text-sm rounded-lg border border-gray-300"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Category Management Section - ADDED */}
          <div className="p-4 mb-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="mb-3 text-lg font-semibold">Quick Add Category</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Category Name (e.g., Appetizers)"
                className="flex-1 p-2 rounded-lg border border-gray-300"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button
                onClick={handleQuickAddCategory}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                disabled={!newCategoryName.trim()}
              >
                + Add Category
              </button>
            </div>
            {categories.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                ✅ Categories: {categories.filter(c => c !== 'All').join(', ')}
              </p>
            )}
          </div>
          {/* End Category Management Section */}

          <button
            className="flex gap-2 items-center px-4 py-2 text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg disabled:opacity-50"
            onClick={() => setShowAddModal(true)}
            disabled={crudLoading}
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Item
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Price
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex gap-3 items-center">
                    <div className="flex justify-center items-center w-10 h-10 font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
                      <Utensils size={16} />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">{item.price}</td>
                <td className="px-4 py-3">{renderStatusBadge(item.status)}</td>
                <td className="px-4 py-3 max-w-xs truncate">
                  {item.description}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    <button
                      className="p-1 text-blue-600 rounded hover:bg-blue-50"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="p-1 text-orange-600 rounded hover:bg-orange-50 disabled:opacity-50"
                      title="Edit"
                      onClick={() => {
                        setEditItem({
                          name: item.name,
                          category: item.category,
                          price: item.price,
                          status: item.status,
                          description: item.description
                        });
                        setSelectedItem(item);
                        setShowEditModal(true);
                      }}
                      disabled={crudLoading}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDeleteModal(true);
                      }}
                      disabled={crudLoading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center p-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing 1 to {filteredItems.length} of {items.length} items
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm rounded-lg border border-gray-300">
            Previous
          </button>
          <button className="px-3 py-1 text-sm text-white bg-orange-600 rounded-lg">
            1
          </button>
          <button className="px-3 py-1 text-sm rounded-lg border border-gray-300">
            2
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'list':
        return <ListTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 animate-spin border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 md:p-8">
      {/* HEADER (updated title) */}
      <div className="flex flex-col gap-4 justify-between items-center mb-4 md:flex-row">
        <div className="flex gap-4 items-center">
          <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
              Restaurant Owner Menu Management  {/* Renamed title */}
            </h1>
            <p className="text-gray-600">
              Manage your restaurant menu items efficiently
            </p>
          </div>
        </div>
      </div>

      {/* Error message (updated) */}
      {backendError && (
        <div className="px-4 py-2 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
          {backendError}
        </div>
      )}

      {/* TAB BUTTONS */}
      <div className="flex overflow-x-auto gap-2 items-center p-1 mb-8 bg-white rounded-xl shadow-sm">
        {['overview', 'list'].map((tab) => (
          <button
            key={tab}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="flex relative z-10 gap-1 items-center capitalize">
              {tab === 'overview' && <Utensils size={16} />}
              {tab === 'list' && <ChefHat size={16} />}
              {tab}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div>
        {renderTabContent()}
      </div>

      {/* ADD ITEM MODAL (now with API) */}
      {showAddModal && (
        <div
          className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/40"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="p-6 w-full max-w-md bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">➕ Add New Menu Item</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  required
                  disabled={crudLoading}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="p-3 w-full rounded-lg border border-gray-300"
                  required
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter((c) => c !== 'All')
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  placeholder="Enter price (e.g., 250)"
                  className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  required
                  disabled={crudLoading}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  placeholder="Enter item description"
                  rows="3"
                  className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  required
                  disabled={crudLoading}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  onClick={() => setShowAddModal(false)}
                  disabled={crudLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  disabled={crudLoading}
                >
                  {crudLoading ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL (now with API and controlled inputs) */}
      {showEditModal && selectedItem && (
        <div
          className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/40"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="p-6 w-full max-w-md bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">✏️ Edit Menu Item</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editItem.name}
                  onChange={handleEditInputChange}
                  placeholder="Enter item name"
                  className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  required
                  disabled={crudLoading}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={editItem.category}
                  onChange={handleEditInputChange}
                  className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  required
                  disabled={crudLoading}
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter((c) => c !== 'All')
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  value={editItem.price}
                  onChange={handleEditInputChange}
                  placeholder="Enter price (e.g., 250)"
                  className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  required
                  disabled={crudLoading}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={editItem.status}
                  onChange={handleEditInputChange}
                  className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  required
                  disabled={crudLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editItem.description}
                  onChange={handleEditInputChange}
                  placeholder="Enter item description"
                  rows="3"
                  className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  required
                  disabled={crudLoading}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  onClick={() => setShowEditModal(false)}
                  disabled={crudLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  disabled={crudLoading}
                >
                  {crudLoading ? 'Updating...' : 'Update Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ITEM MODAL (now with API) */}
      {showDeleteModal && selectedItem && (
        <div
          className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/40"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="p-6 w-full max-w-sm bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-red-600">🗑️ Delete Menu Item</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <strong>{selectedItem.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                onClick={() => setShowDeleteModal(false)}
                disabled={crudLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                onClick={handleDeleteItem}
                disabled={crudLoading}
              >
                {crudLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantOwnerMenuListPage;
