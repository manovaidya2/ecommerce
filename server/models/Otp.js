import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        default: "",
    },
    otp: {
        type: String,
        trim: true,
        default: "",
    },
    otpExpiry: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

// Pre-save middleware to update the updated_at field
otpSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp