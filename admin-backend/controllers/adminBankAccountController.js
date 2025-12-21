import { BankAccount } from '../models/BankAccount.js';
import { Restaurant } from '../models/Restaurant.js'; // ✅ NEW
import { RestaurantOwner } from '../models/RestaurantOwner.js'; // ✅ NEW

// Get Pending Bank Accounts
export const getPendingBankAccounts = async (req, res) => {
    try {
        console.log('🔍 Fetching pending bank accounts...');

        const pendingBanks = await BankAccount.find({ status: 'Pending' })
            .populate({
                path: 'restaurantId',
                populate: {
                    path: 'owner',
                    model: 'RestaurantOwner',
                    select: 'name email phone isApproved'
                }
            })
            .sort({ createdAt: 1 });

        console.log(`✅ Found ${pendingBanks.length} pending bank accounts`);
        console.log('Bank accounts:', JSON.stringify(pendingBanks, null, 2));

        res.status(200).json({
            success: true,
            data: pendingBanks
        });
    } catch (error) {
        console.error('❌ Error fetching pending bank accounts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending requests' });
    }
};

// Update Bank Account Status (Approve/Reject)
export const updateBankAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // 'Approved' or 'Rejected'

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const bankAccount = await BankAccount.findById(id);
        if (!bankAccount) {
            return res.status(404).json({ success: false, message: 'Bank account not found' });
        }

        bankAccount.status = status;
        if (status === 'Rejected') {
            bankAccount.rejectionReason = rejectionReason || 'No reason provided';
        } else if (status === 'Approved') {
            // If approved, check if it's the first one, make it primary? 
            // Or handle primary logic separately. For now just approve.
            const count = await BankAccount.countDocuments({ restaurantId: bankAccount.restaurantId, status: 'Approved' });
            if (count === 0) {
                bankAccount.isPrimary = true;
            }
        }

        await bankAccount.save();

        res.status(200).json({
            success: true,
            message: `Bank account ${status} successfully`,
            data: bankAccount
        });

    } catch (error) {
        console.error('Error updating bank account status:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
};
