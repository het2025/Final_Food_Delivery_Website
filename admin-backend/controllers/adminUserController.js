import mongoose from 'mongoose';

let customerDB;

const getCustomerDB = async () => {
  if (!customerDB) {
    customerDB = mongoose.createConnection(process.env.MONGO_URI);
    await customerDB.asPromise();
  }
  return customerDB;
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private
export const getAllUsers = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const usersCollection = customerConn.collection('users');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build query
    let query = { role: 'customer' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      usersCollection
        .find(query)
        .project({ password: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      usersCollection.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const usersCollection = customerConn.collection('users');
    const ordersCollection = customerConn.collection('orders');

    const userId = new mongoose.Types.ObjectId(req.params.id);

    // Get user details
    const user = await usersCollection.findOne(
      { _id: userId },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user orders
    const orders = await ordersCollection
      .find({ customer: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Calculate user stats
    const orderStats = await ordersCollection.aggregate([
      { $match: { customer: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const stats = orderStats.length > 0 ? orderStats[0] : {
      totalOrders: 0,
      totalSpent: 0,
      completedOrders: 0
    };

    res.status(200).json({
      success: true,
      data: {
        user,
        orders,
        stats
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private
export const updateUserStatus = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const usersCollection = customerConn.collection('users');

    const userId = new mongoose.Types.ObjectId(req.params.id);
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive field is required'
      });
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: userId },
      { $set: { isActive: Boolean(isActive), updatedAt: new Date() } },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: result.value
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const usersCollection = customerConn.collection('users');

    const userId = new mongoose.Types.ObjectId(req.params.id);

    const result = await usersCollection.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};
