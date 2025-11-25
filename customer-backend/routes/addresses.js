const express = require('express');
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAddresses)
  .post(addAddress);

router.route('/:addressId')
  .put(updateAddress)
  .delete(deleteAddress);

module.exports = router;
