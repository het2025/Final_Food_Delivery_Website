// Function to update RestaurantOwner approval status
// Call this after approving a restaurant in the admin panel
async function updateRestaurantOwnerApproval(restaurantId, adminId) {
    const mongoose = require('mongoose');

    try {
        // Connect to restaurant database
        const restaurantConn = mongoose.createConnection(process.env.RESTAURANT_DB_URI || process.env.MONGO_URI);
        await restaurantConn.asPromise();

        // Define minimal schema
        const RestaurantOwnerSchema = new mongoose.Schema({}, { strict: false });
        const RestaurantOwner = restaurantConn.model('RestaurantOwner', RestaurantOwnerSchema);

        // Update the owner
        const result = await RestaurantOwner.updateOne(
            { restaurant: new mongoose.Types.ObjectId(restaurantId) },
            {
                $set: {
                    isApproved: true,
                    approvedAt: new Date(),
                    approvedBy: new mongoose.Types.ObjectId(adminId)
                }
            }
        );

        console.log(`✅ Updated RestaurantOwner approval: ${result.modifiedCount} modified`);
        await restaurantConn.close();

        return { success: true, modified: result.modifiedCount };
    } catch (error) {
        console.error('❌ Error updating RestaurantOwner:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { updateRestaurantOwnerApproval };
