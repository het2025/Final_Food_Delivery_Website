import mongoose from 'mongoose';

let customerDB;

const getCustomerDB = async () => {
  if (!customerDB) {
    customerDB = mongoose.createConnection(process.env.MONGO_URI);
    await customerDB.asPromise();
  }
  return customerDB;
};

// @desc    Get all restaurants (from BOTH collections - old + new)
// @route   GET /api/admin/restaurants
// @access  Private
export const getAllRestaurants = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const restaurantsCollection = customerConn.collection('restaurants');
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    // Fetch from BOTH collections
    const [oldRestaurants, newRestaurants] = await Promise.all([
      restaurantsCollection.find(query).sort({ createdAt: -1 }).toArray(),
      newRestaurantsCollection.find(query).sort({ registeredAt: -1, createdAt: -1 }).toArray()
    ]);

    // Mark new restaurants with isNew flag
    const markedOldRestaurants = oldRestaurants.map(r => ({
      ...r,
      isNew: false,
      source: 'restaurants'
    }));

    const markedNewRestaurants = newRestaurants.map(r => ({
      ...r,
      isNew: true,
      source: 'new_registered_restaurants'
    }));

    // Combine both arrays
    const allRestaurants = [...markedNewRestaurants, ...markedOldRestaurants];

    // Apply pagination
    const paginatedRestaurants = allRestaurants.slice(skip, skip + limit);
    const total = allRestaurants.length;

    res.status(200).json({
      success: true,
      data: paginatedRestaurants,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRestaurants: total,
        oldRestaurants: oldRestaurants.length,
        newRestaurants: newRestaurants.length
      }
    });
  } catch (error) {
    console.error('Get all restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurants',
      error: error.message
    });
  }
};

// @desc    Get only newly registered restaurants (pending approval)
// @route   GET /api/admin/restaurants/pending
// @access  Private
export const getPendingRestaurants = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    // Fetch only from new_registered_restaurants collection
    const pendingRestaurants = await newRestaurantsCollection
      .find({ status: { $ne: 'rejected' } })
      .sort({ registeredAt: -1, createdAt: -1 })
      .toArray();

    console.log(`Found ${pendingRestaurants.length} pending restaurants for approval`);

    res.status(200).json({
      success: true,
      data: pendingRestaurants,
      count: pendingRestaurants.length
    });
  } catch (error) {
    console.error('Get pending restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending restaurants',
      error: error.message
    });
  }
};

// @desc    Approve restaurant (move from new_registered to main restaurants)
// @route   POST /api/admin/restaurants/:id/approve
// @access  Private
export const approveRestaurant = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');
    const restaurantsCollection = customerConn.collection('restaurants');

    const restaurantId = new mongoose.Types.ObjectId(req.params.id);

    // Find restaurant in new_registered_restaurants collection
    const restaurant = await newRestaurantsCollection.findOne({ _id: restaurantId });

    if (!restaurant) {
      // Check if it was already moved to main collection (idempotency)
      const alreadyApproved = await restaurantsCollection.findOne({ _id: restaurantId });
      if (alreadyApproved) {
        console.log(`Restaurant ${restaurantId} already in main collection. Skipping move.`);
      } else {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found in pending list'
        });
      }
    } else {
      // Check if already exists in main collection (to handle retries/duplicates)
      const existingRestaurant = await restaurantsCollection.findOne({
        $or: [
          { _id: restaurantId },
          { restaurantId: restaurantId.toString() }
        ]
      });

      if (existingRestaurant) {
        console.log(`Restaurant ${restaurantId} already exists in main collection. Updating instead of inserting.`);

        // Update existing
        await restaurantsCollection.updateOne(
          { _id: existingRestaurant._id },
          {
            $set: {
              status: 'active',
              isActive: true,
              approvedAt: new Date(),
              approvedBy: req.admin._id
            }
          }
        );
      } else {
        // Prepare approved restaurant data
        const approvedRestaurant = {
          ...restaurant,
          approvedAt: new Date(),
          approvedBy: req.admin._id,
          status: 'active',
          isActive: true
        };

        // Remove _id and restaurantId to avoid conflicts/duplicates
        delete approvedRestaurant._id;
        delete approvedRestaurant.restaurantId;

        // Insert into main restaurants collection
        await restaurantsCollection.insertOne({
          _id: restaurantId, // Keep same ID
          restaurantId: restaurantId.toString(), // Ensure unique restaurantId
          ...approvedRestaurant
        });
      }

      // Delete from new_registered_restaurants collection
      await newRestaurantsCollection.deleteOne({ _id: restaurantId });
    }

    // ✅ UPDATE RestaurantOwner in restaurant database
    try {
      const restaurantConn = mongoose.createConnection(process.env.RESTAURANT_DB_URI || process.env.MONGO_URI);
      await restaurantConn.asPromise();

      const RestaurantOwnerSchema = new mongoose.Schema({}, { strict: false });
      const RestaurantOwner = restaurantConn.model('RestaurantOwner', RestaurantOwnerSchema);

      const ownerUpdate = await RestaurantOwner.updateOne(
        { restaurant: restaurantId },
        {
          $set: {
            isApproved: true,
            approvedAt: new Date(),
            approvedBy: req.admin._id
          }
        }
      );

      console.log(`✅ RestaurantOwner updated: ${ownerUpdate.modifiedCount} modified`);
      await restaurantConn.close();
    } catch (ownerError) {
      console.error('⚠️ RestaurantOwner update error:', ownerError.message);
      // Don't fail the whole approval if this fails
    }

    console.log(`Restaurant "${restaurantId}" approved and moved to main collection`);

    res.status(200).json({
      success: true,
      message: 'Restaurant approved successfully',
      data: {
        restaurantId,
        restaurantName: restaurant ? restaurant.name : 'Approved Restaurant'
      }
    });
  } catch (error) {
    console.error('Approve restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving restaurant',
      error: error.message
    });
  }
};

// @desc    Reject restaurant
// @route   POST /api/admin/restaurants/:id/reject
// @access  Private
export const rejectRestaurant = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const restaurantId = new mongoose.Types.ObjectId(req.params.id);
    const { reason } = req.body;

    const result = await newRestaurantsCollection.findOneAndUpdate(
      { _id: restaurantId },
      {
        $set: {
          status: 'rejected',
          rejectionReason: reason || 'No reason provided',
          rejectedAt: new Date(),
          rejectedBy: req.admin._id
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant rejected',
      data: result.value
    });
  } catch (error) {
    console.error('Reject restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting restaurant'
    });
  }
};

// @desc    Update restaurant status
// @route   PUT /api/admin/restaurants/:id/status
// @access  Private
export const updateRestaurantStatus = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const restaurantsCollection = customerConn.collection('restaurants');
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const restaurantId = new mongoose.Types.ObjectId(req.params.id);
    const { status } = req.body;

    if (!['active', 'inactive', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, inactive, or closed'
      });
    }

    // Try to update in both collections
    const result1 = await restaurantsCollection.findOneAndUpdate(
      { _id: restaurantId },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    const result2 = await newRestaurantsCollection.findOneAndUpdate(
      { _id: restaurantId },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    const result = result1.value || result2.value;

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant status updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update restaurant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant status'
    });
  }
};

// @desc    Delete restaurant (from both collections)
// @route   DELETE /api/admin/restaurants/:id
// @access  Private
export const deleteRestaurant = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const restaurantsCollection = customerConn.collection('restaurants');
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const restaurantId = new mongoose.Types.ObjectId(req.params.id);

    // Try to delete from both collections
    const result1 = await restaurantsCollection.deleteOne({ _id: restaurantId });
    const result2 = await newRestaurantsCollection.deleteOne({ _id: restaurantId });

    if (result1.deletedCount === 0 && result2.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting restaurant'
    });
  }
};

// @desc    Get restaurant by ID (from any collection)
// @route   GET /api/admin/restaurants/:id
// @access  Private
export const getRestaurantById = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const restaurantsCollection = customerConn.collection('restaurants');
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const restaurantId = new mongoose.Types.ObjectId(req.params.id);

    // Try to find in both collections
    let restaurant = await restaurantsCollection.findOne({ _id: restaurantId });
    let isNew = false;

    if (!restaurant) {
      restaurant = await newRestaurantsCollection.findOne({ _id: restaurantId });
      isNew = true;
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...restaurant,
        isNew
      }
    });
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant details'
    });
  }
};
