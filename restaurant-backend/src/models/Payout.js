import mongoose from 'mongoose';

const PayoutSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    breakdown: {
        dishPrice: {
            type: Number,
            default: 0
        },
        taxes: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Completed'
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const Payout = mongoose.model('Payout', PayoutSchema);
