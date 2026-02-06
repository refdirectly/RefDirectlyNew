import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { sendOTP } from '../services/emailService';

const router = express.Router();

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email address.' 
      });
    }

    // Generate 6-digit OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in user document
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = new Date(Date.now() + 600000); // 10 minutes
    await user.save();

    // Send OTP via existing email service
    await sendOTP(email, otp);

    res.json({ 
      success: true, 
      message: 'Password reset OTP sent to your email. Valid for 10 minutes.' 
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send reset OTP. Please try again.' 
    });
  }
});

// Verify OTP and reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, OTP, and new password are required' 
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password reset successful. You can now login with your new password.' 
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password. Please try again.' 
    });
  }
});

export default router;
