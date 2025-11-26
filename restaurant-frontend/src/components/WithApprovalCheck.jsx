import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentRestaurantOwner, logoutRestaurantOwner } from '../api/restaurantOwnerApi';
import ApprovalPending from './ApprovalPending';

/**
 * Higher-order component that wraps dashboard pages
 * Shows ApprovalPending overlay if restaurant owner is not approved yet
 */
function WithApprovalCheck({ children }) {
    const [isApproved, setIsApproved] = useState(null); // null = checking, true/false = result
    const [checkingRefresh, setCheckingRefresh] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkApprovalStatus();
    }, []);

    const checkApprovalStatus = async () => {
        try {
            const userRes = await getCurrentRestaurantOwner();
            if (userRes.success && userRes.data) {
                setIsApproved(userRes.data.isApproved || false);
            } else {
                // If can't fetch user, assume approved to avoid blocking
                setIsApproved(true);
            }
        } catch (err) {
            console.error('Failed to check approval status:', err);
            // If error, assume approved to avoid blocking
            setIsApproved(true);
        }
    };

    const handleLogout = () => {
        logoutRestaurantOwner();
        navigate('/');
    };

    const handleRefresh = async () => {
        setCheckingRefresh(true);
        await checkApprovalStatus();
        setCheckingRefresh(false);
    };

    // Still loading approval status
    if (isApproved === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-orange-500 rounded-full animate-spin border-t-transparent" />
            </div>
        );
    }

    // Not approved - show pending overlay
    if (!isApproved) {
        return (
            <ApprovalPending
                onLogout={handleLogout}
                onRefresh={handleRefresh}
                refreshing={checkingRefresh}
            />
        );
    }

    // Approved - show children
    return <>{children}</>;
}

export default WithApprovalCheck;
