import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5002/api/admin';

const AdminPayoutsPage = () => {
    const [pendingBanks, setPendingBanks] = useState([]);
    const [filteredBanks, setFilteredBanks] = useState([]); // ✅ NEW: For search
    const [searchTerm, setSearchTerm] = useState(''); // ✅ NEW
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingBanks();
    }, []);

    useEffect(() => {
        // ✅ Filter banks based on search term
        if (!searchTerm.trim()) {
            setFilteredBanks(pendingBanks);
        } else {
            const filtered = pendingBanks.filter(bank =>
                bank.restaurantId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bank.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bank.accountHolderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bank.restaurantId?.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredBanks(filtered);
        }
    }, [searchTerm, pendingBanks]);

    const fetchPendingBanks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${API_BASE_URL}/payouts/bank-accounts/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPendingBanks(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching pending banks:', err);
            toast.error('Failed to load pending requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status, reason = '') => {
        if (!confirm(`Are you sure you want to ${status} this bank account?`)) return;

        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(
                `${API_BASE_URL}/payouts/bank-accounts/${id}/status`,
                { status, rejectionReason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Bank account ${status} successfully`);
            fetchPendingBanks(); // Refresh list
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    const handleReject = (id) => {
        const reason = prompt('Enter rejection reason:');
        if (reason) {
            handleStatusUpdate(id, 'Rejected', reason);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Pending Bank Approvals</h1>

            {/* ✅ Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by restaurant name, bank name, account holder, or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : filteredBanks.length === 0 ? (
                <div className="text-gray-500 text-center py-10">
                    {searchTerm ? `No results found for "${searchTerm}"` : 'No pending bank approvals.'}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBanks.map((bank) => (
                        <div key={bank._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                            <div className="flex items-center gap-2 mb-4 text-gray-700">
                                <Building2 size={24} />
                                <h3 className="font-bold text-lg">{bank.bankName}</h3>
                            </div>

                            <div className="space-y-2 mb-6 text-sm text-gray-600">
                                {/* ✅ Restaurant Details */}
                                <div className="border-b pb-2 mb-2">
                                    <p className="font-semibold text-black mb-1">Restaurant Information</p>
                                    <p><span className="font-semibold text-black">Name:</span> {bank.restaurantId?.name || 'N/A'}</p>
                                    <p><span className="font-semibold text-black">Cuisine:</span> {bank.restaurantId?.cuisine?.join(', ') || 'N/A'}</p>
                                    <p><span className="font-semibold text-black">Location:</span> {bank.restaurantId?.location?.area || 'N/A'}</p>
                                    <p><span className="font-semibold text-black">GST:</span> {bank.restaurantId?.gstNumber || 'N/A'}</p>
                                </div>

                                {/* ✅ Owner Details */}
                                <div className="border-b pb-2 mb-2">
                                    <p className="font-semibold text-black mb-1">Owner Information</p>
                                    <p><span className="font-semibold text-black">Name:</span> {bank.restaurantId?.owner?.name || 'N/A'}</p>
                                    <p><span className="font-semibold text-black">Email:</span> {bank.restaurantId?.owner?.email || 'N/A'}</p>
                                    <p><span className="font-semibold text-black">Phone:</span> {bank.restaurantId?.owner?.phone || 'N/A'}</p>
                                </div>

                                {/* Bank Details */}
                                <div>
                                    <p className="font-semibold text-black mb-1">Bank Account Details</p>
                                    <p><span className="font-semibold text-black">Account Holder:</span> {bank.accountHolderName}</p>
                                    <p><span className="font-semibold text-black">Account No:</span> {bank.accountNumber}</p>
                                    <p><span className="font-semibold text-black">IFSC Code:</span> {bank.ifscCode}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleStatusUpdate(bank._id, 'Approved')}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"
                                >
                                    <Check size={18} /> Approve
                                </button>
                                <button
                                    onClick={() => handleReject(bank._id)}
                                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-200 transition"
                                >
                                    <X size={18} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPayoutsPage;
