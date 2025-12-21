import { findRestaurantByOwner } from '../models/Restaurant.js';
import { RestaurantOwner } from '../models/RestaurantOwner.js';
import { BankAccount } from '../models/BankAccount.js';
import mongoose from 'mongoose';

// ✅ GET PROFILE: Restaurant details for Profile Settings page
export const getRestaurantProfile = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;

    const restaurant = await findRestaurantByOwner(restaurantOwnerId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load profile'
    });
  }
};

// ✅ UPDATE PROFILE: Update restaurant details from Profile Settings
export const updateRestaurantProfile = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const {
      name,
      description,
      image,
      cuisine,
      gstNumber,
      deliveryTime,
      priceRange,
      location,
      contact
    } = req.body;

    if (!name || !location?.area || !location?.address) {
      return res.status(400).json({
        success: false,
        message: 'Name, area, and address are required'
      });
    }

    const updatedData = {
      name: name.trim(),
      description: description?.trim() || '',
      image: image || '',
      cuisine: cuisine || [],
      gstNumber: gstNumber?.trim() || '',
      deliveryTime: deliveryTime || '30',
      priceRange: priceRange || '₹₹',
      location: {
        area: location.area.trim(),
        address: location.address.trim(),
        city: location.city?.trim() || '',
        state: location.state?.trim() || 'Gujarat',
        pincode: location.pincode?.toString() || '',
        coordinates: location.coordinates || [0, 0]
      },
      contact: {
        phone: contact?.phone || '',
        email: contact?.email || ''
      }
    };

    // Find restaurant to determine which collection to update
    const restaurant = await findRestaurantByOwner(restaurantOwnerId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Update the found document
    Object.assign(restaurant, updatedData);
    await restaurant.save();

    res.json({
      success: true,
      data: restaurant,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// ✅ UPDATE OWNER INFO: Name, email, phone (optional)
export const updateOwnerInfo = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const { name, phone } = req.body;

    const owner = await RestaurantOwner.findByIdAndUpdate(
      restaurantOwnerId,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: owner,
      message: 'Owner info updated successfully'
    });
  } catch (error) {
    console.error('Update owner info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update owner info'
    });
  }
};

// ✅ Add Bank Account
export const addBankAccount = async (req, res) => {
  try {
    const ownerId = req.restaurantOwner.id;
    const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

    const restaurant = await findRestaurantByOwner(ownerId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const newBank = new BankAccount({
      restaurantId: restaurant._id,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      isPrimary: false,
      status: 'Pending'
    });

    await newBank.save();

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully. Waiting for admin approval.',
      data: newBank
    });

  } catch (error) {
    console.error('Error adding bank account:', error);
    res.status(500).json({ success: false, message: 'Failed to add bank account', error: error.message });
  }
};

// ✅ Get Bank Accounts
export const getBankAccounts = async (req, res) => {
  try {
    const ownerId = req.restaurantOwner.id;

    const restaurant = await findRestaurantByOwner(ownerId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const banks = await BankAccount.find({ restaurantId: restaurant._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: banks
    });

  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bank accounts' });
  }
};

// ✅ Delete Bank Account (only if approved)
export const deleteBankAccount = async (req, res) => {
  try {
    const ownerId = req.restaurantOwner.id;
    const { id } = req.params;

    const restaurant = await findRestaurantByOwner(ownerId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const bankAccount = await BankAccount.findOne({ _id: id, restaurantId: restaurant._id });
    if (!bankAccount) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    // Only allow deletion of approved accounts
    if (bankAccount.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Can only delete approved bank accounts' });
    }

    await BankAccount.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({ success: false, message: 'Failed to delete bank account' });
  }
};
