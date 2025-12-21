import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Building2, Plus, Lock, AlertTriangle, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api'; // Restaurant Backend

const PayoutsPage = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview | bank-details
    const [stats, setStats] = useState(null);
    const [banks, setBanks] = useState([]);
    const [payoutHistory, setPayoutHistory] = useState([]); // ✅ NEW
    const [loading, setLoading] = useState(true);

    console.log('🎯 PayoutsPage component mounted'); // DEBUG

    // Modal States
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showAddBankModal, setShowAddBankModal] = useState(false);
    const [showPayoutModal, setShowPayoutModal] = useState(false); // ✅ NEW
    const [payoutAmount, setPayoutAmount] = useState(0); // ✅ NEW

    // Form State
    const [formData, setFormData] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('restaurantOwnerToken');
            const headers = { Authorization: `Bearer ${token}` };

            if (activeTab === 'overview') {
                const res = await axios.get(`${API_BASE_URL}/dashboard/payouts-stats`, { headers });
                if (res.data.success) setStats(res.data.data);

                // ✅ Also fetch history when on overview
                const historyRes = await axios.get(`${API_BASE_URL}/dashboard/payout-history`, { headers });
                if (historyRes.data.success) setPayoutHistory(historyRes.data.data);
            } else {
                const res = await axios.get(`${API_BASE_URL}/profile/bank-account`, { headers });
                if (res.data.success) setBanks(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBankClick = () => {
        if (banks.length > 0) {
            setShowWarningModal(true);
        } else {
            setShowAddBankModal(true);
        }
    };

    const handleConfirmWarning = () => {
        setShowWarningModal(false);
        setShowAddBankModal(true);
    };

    const handleAddBankSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('restaurantOwnerToken');
            await axios.post(
                `${API_BASE_URL}/profile/bank-account`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Bank account added! Waiting for approval.');
            setShowAddBankModal(false);
            setFormData({ accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '' });
            fetchData(); // Refresh list
        } catch (err) {
            alert('Failed to add bank account: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteBank = async (bankId) => {
        if (!confirm('Are you sure you want to delete this bank account?')) return;

        try {
            const token = localStorage.getItem('restaurantOwnerToken');
            await axios.delete(
                `${API_BASE_URL}/profile/bank-account/${bankId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Bank account deleted successfully');
            fetchData(); // Refresh list
        } catch (err) {
            alert('Failed to delete bank account: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCollectPayout = async () => {
        if (!stats || stats.pendingPayout <= 0) {
            alert('No pending payout available');
            return;
        }

        try {
            const token = localStorage.getItem('restaurantOwnerToken');
            const res = await axios.post(
                `${API_BASE_URL}/dashboard/collect-payout`,
                {
                    amount: stats.pendingPayout,
                    breakdown: stats.breakdown
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setPayoutAmount(stats.pendingPayout);
                setShowPayoutModal(true);
                // Refresh data
                setTimeout(() => {
                    setShowPayoutModal(false);
                    fetchData();
                }, 3000);
            }
        } catch (err) {
            alert('Failed to collect payout: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Payouts & Bank Details</h1>

            {/* Tabs */}
            <div className="flex space-x-4 border-b mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-red-600 font-bold text-red-600' : 'text-gray-500'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('bank-details')}
                    className={`pb-2 px-4 ${activeTab === 'bank-details' ? 'border-b-2 border-red-600 font-bold text-red-600' : 'text-gray-500'}`}
                >
                    Bank Details Management
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <>
                    {activeTab === 'overview' && stats && (
                        <div>
                            {/* Pending Payout Card */}
                            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mb-6">
                                <h2 className="text-gray-500 mb-2">Total Pending Payout</h2>
                                <div className="text-4xl font-bold text-green-600">
                                    ₹{(stats.pendingPayout || 0).toLocaleString()}
                                </div>

                                <div className="mt-4 text-sm text-gray-500 border-t pt-4">
                                    <div className="flex justify-between mb-2">
                                        <span>Dish Price Earnings:</span>
                                        <span className="font-semibold">₹{stats.breakdown.dishPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span>Tax Collected:</span>
                                        <span className="font-semibold">₹{stats.breakdown.taxes.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-black border-t pt-2">
                                        <span>Total:</span>
                                        <span>₹{(stats.breakdown.dishPrice + stats.breakdown.taxes).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Collect Payout Button */}
                                <button
                                    onClick={handleCollectPayout}
                                    disabled={!stats.pendingPayout || stats.pendingPayout <= 0}
                                    className={`mt-6 w-full py-3 rounded-lg font-semibold text-white transition ${stats.pendingPayout > 0
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    {stats.pendingPayout > 0 ? 'Collect Payout' : 'No Pending Payout'}
                                </button>
                            </div>

                            {/* Payout History */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-lg font-semibold mb-4">Payout History</h2>
                                {payoutHistory.length === 0 ? (
                                    <p className="text-gray-500 italic">No payout history yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {payoutHistory.map((payout) => (
                                            <div key={payout._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                                                <div>
                                                    <p className="font-semibold text-green-700">₹{payout.amount.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(payout.transactionDate).toLocaleString('en-IN', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short'
                                                        })}
                                                    </p>
                                                </div>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                    {payout.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bank-details' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold">Your Linked Accounts</h2>
                                <button
                                    onClick={handleAddBankClick}
                                    className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"
                                >
                                    <Plus size={18} /> Add New Bank
                                </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {banks.map((bank) => (
                                    <div key={bank._id} className="border rounded-lg p-5 bg-gray-50 relative">
                                        <div className="absolute top-4 right-4 text-gray-400">
                                            {bank.status === 'Approved' ? <Lock size={18} /> : <span className="text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-1 rounded">PENDING</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <Building2 className="text-gray-600" />
                                            <h3 className="font-bold">{bank.bankName}</h3>
                                        </div>
                                        <div className="text-sm space-y-2 text-gray-600">
                                            <p>Account Holder: <span className="font-medium text-black">{bank.accountHolderName}</span></p>
                                            <p>Account No: <span className="font-medium text-black">•••• {bank.accountNumber.slice(-4)}</span></p>
                                            <p>IFSC: <span className="font-medium text-black">{bank.ifscCode}</span></p>
                                        </div>

                                        {/* ✅ Delete button for approved accounts */}
                                        {bank.status === 'Approved' && (
                                            <button
                                                onClick={() => handleDeleteBank(bank._id)}
                                                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
                                            >
                                                <Trash2 size={16} />
                                                Delete Account
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {banks.length === 0 && <p className="text-gray-500 italic">No bank accounts added yet.</p>}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Warning Modal */}
            {showWarningModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                        <div className="flex items-center gap-3 text-yellow-600 mb-4">
                            <AlertTriangle size={32} />
                            <h2 className="text-xl font-bold">Important Notice</h2>
                        </div>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            You may add new bank details; however, you must email the company with your
                            <span className="font-bold"> existing (old) bank account details</span>.
                            for verification. This allows us to cross-check the information and confirm your identity before approving the new bank account. Until both the old and new bank details are approved, payouts may be temporarily paused.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowWarningModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmWarning}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                I Understand, Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Bank Modal */}
            {showAddBankModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Add Bank Details</h2>
                        <form onSubmit={handleAddBankSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Bank Name</label>
                                <input
                                    type="text" required
                                    className="w-full border p-2 rounded"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Account Holder Name</label>
                                <input
                                    type="text" required
                                    className="w-full border p-2 rounded"
                                    value={formData.accountHolderName}
                                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Account Number</label>
                                <input
                                    type="text" required
                                    className="w-full border p-2 rounded"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">IFSC Code</label>
                                <input
                                    type="text" required
                                    className="w-full border p-2 rounded uppercase"
                                    value={formData.ifscCode}
                                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddBankModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Save Details
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ✅ Payout Confirmation Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg max-w-md w-full text-center">
                        <div className="mb-4">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payout Collected!</h2>
                            <p className="text-gray-600 mb-4">You have successfully collected:</p>
                            <div className="text-4xl font-bold text-green-600 mb-6">
                                ₹{payoutAmount.toLocaleString()}
                            </div>
                            <p className="text-sm text-gray-500">This amount has been transferred to your bank account.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayoutsPage;
