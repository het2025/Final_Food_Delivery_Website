import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Star,
  Package,
  Filter
} from 'lucide-react'
import {
  getAdditives,
  createAdditive,
  updateAdditive,
  deleteAdditive
} from '../../api/restaurantOwnerApi'

function AdditivesPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdditive, setSelectedAdditive] = useState(null)
  const [additives, setAdditives] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [newAdditive, setNewAdditive] = useState({
    name: '',
    category: '',
    price: '',
    description: ''
  })

  useEffect(() => {
    const loadAdditives = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await getAdditives()
        const data = Array.isArray(res.data) ? res.data : []
        setAdditives(data)
      } catch (err) {
        console.error('Error loading additives:', err)
        setError(err.message || 'Failed to load additives')
      } finally {
        setLoading(false)
      }
    }

    loadAdditives()
  }, [])

  const categories = [
    'All',
    ...new Set(additives.map((a) => a.category).filter(Boolean))
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAdditive((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAdditive = async (e) => {
    e.preventDefault()

    if (!newAdditive.name || !newAdditive.category || !newAdditive.price) {
      setError('Please fill name, category and price')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        name: newAdditive.name,
        category: newAdditive.category,
        price: Number(newAdditive.price),
        description: newAdditive.description,
        isAvailable: true
      }

      const res = await createAdditive(payload)
      setAdditives((prev) => [res.data, ...prev])
      setShowAddModal(false)
      setNewAdditive({ name: '', category: '', price: '', description: '' })
    } catch (err) {
      console.error('Error adding additive:', err)
      setError(err.message || 'Failed to add additive')
    } finally {
      setSaving(false)
    }
  }

  const handleEditAdditive = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const name = formData.get('name')
    const category = formData.get('category')
    const price = formData.get('price')
    const status = formData.get('status')
    const description = formData.get('description')

    if (!name || !category || !price) {
      setError('Please fill name, category and price')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        name,
        category,
        price: Number(price),
        description,
        isAvailable: status === 'active'
      }

      const res = await updateAdditive(selectedAdditive._id, payload)
      setAdditives((prev) =>
        prev.map((a) => (a._id === selectedAdditive._id ? res.data : a))
      )
      setShowEditModal(false)
      setSelectedAdditive(null)
    } catch (err) {
      console.error('Error updating additive:', err)
      setError(err.message || 'Failed to update additive')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAdditive = async () => {
    try {
      setSaving(true)
      setError('')

      await deleteAdditive(selectedAdditive._id)
      setAdditives((prev) => prev.filter((a) => a._id !== selectedAdditive._id))
      setShowDeleteModal(false)
      setSelectedAdditive(null)
    } catch (err) {
      console.error('Error deleting additive:', err)
      setError(err.message || 'Failed to delete additive')
    } finally {
      setSaving(false)
    }
  }

  const filteredAdditives = additives.filter((additive) => {
    const matchesSearch =
      additive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      additive.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'All' || additive.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalAdditives = additives.length
  const activeAdditives = additives.filter((a) => a.isAvailable).length
  const uniqueCategories = new Set(
    additives.map((a) => a.category).filter(Boolean)
  ).size

  const additivesStats = [
    { label: 'Total Additives', value: String(totalAdditives), icon: Package },
    { label: 'Active Additives', value: String(activeAdditives), icon: Star },
    { label: 'Categories', value: String(uniqueCategories), icon: Filter },
    {
      label: 'Inactive',
      value: String(totalAdditives - activeAdditives),
      icon: Plus
    }
  ]

  const renderStatusBadge = (isAvailable) => {
    const status = isAvailable ? 'active' : 'inactive'
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    const Icon = statusConfig[status]?.icon || AlertCircle

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
          statusConfig[status]?.color || 'bg-gray-100 text-gray-800'
        }`}
      >
        <Icon size={12} />
        {status}
      </span>
    )
  }

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {additivesStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className="p-2 rounded-lg bg-orange-50">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Additives */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-5">Recent Additives</h2>
        <div className="space-y-4">
          {additives.slice(0, 5).map((additive) => (
            <div
              key={additive._id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold">
                  <Package size={16} />
                </div>
                <div>
                  <p className="font-medium">{additive.name}</p>
                  <p className="text-sm text-gray-600">{additive.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{additive.price.toFixed(2)}</p>
                {renderStatusBadge(additive.isAvailable)}
              </div>
            </div>
          ))}
          {additives.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No additives yet. Click "Add Additive" to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const ListTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold">All Additives</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search additives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-4 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                Additive
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAdditives.map((additive) => (
              <tr key={additive._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold">
                      <Package size={16} />
                    </div>
                    <p className="font-medium">{additive.name}</p>
                  </div>
                </td>
                <td className="py-3 px-4">{additive.category}</td>
                <td className="py-3 px-4">₹{additive.price.toFixed(2)}</td>
                <td className="py-3 px-4">
                  {renderStatusBadge(additive.isAvailable)}
                </td>
                <td className="py-3 px-4 max-w-xs truncate">
                  {additive.description || '—'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                      onClick={() => {
                        setSelectedAdditive(additive)
                        setShowEditModal(true)
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      onClick={() => {
                        setSelectedAdditive(additive)
                        setShowDeleteModal(true)
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAdditives.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 px-4 text-center text-sm text-gray-500"
                >
                  No additives found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {filteredAdditives.length} of {additives.length} additives
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Additives Management
          </h1>
          <p className="text-gray-600">
            Manage your menu additives and ingredients
          </p>
        </div>
      </div>

      {/* TAB BUTTONS */}
      <div className="flex gap-2 bg-white rounded-xl p-1 mb-8 shadow-sm">
        {['overview', 'list'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="capitalize flex items-center gap-1">
              {tab === 'overview' && <Package size={16} />}
              {tab === 'list' && <Star size={16} />}
              {tab}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'overview' ? <OverviewTab /> : <ListTab />}

      {/* ADD MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">➕ Add New Additive</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdditive} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additive Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAdditive.name}
                  onChange={handleInputChange}
                  placeholder="Enter additive name"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={newAdditive.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Dairy, Meat, Vegetables"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={newAdditive.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newAdditive.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedAdditive && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">✏️ Edit Additive</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAdditive} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedAdditive.name}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  defaultValue={selectedAdditive.category}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  defaultValue={selectedAdditive.price}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={
                    selectedAdditive.isAvailable ? 'active' : 'inactive'
                  }
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={selectedAdditive.description}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedAdditive && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-red-600">
                🗑️ Delete Additive
              </h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <strong>{selectedAdditive.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                onClick={() => setShowDeleteModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
                onClick={handleDeleteAdditive}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdditivesPage
