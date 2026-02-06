// Test Notification System
// Usage: Call this from your backend to test notifications

import notificationService from '../services/notificationService';

export async function sendTestNotification(recipientUserId: string, recipientRole: string) {
  await notificationService.create({
    senderId: 'test-sender-id',
    recipientUserId,
    recipientRole: recipientRole as any,
    title: '🎉 Test Notification',
    message: 'This is a test notification from the Instagram-style notification system!',
    type: 'system',
    avatarUrl: 'https://ui-avatars.com/api/?name=Test+User&background=8B5CF6&color=fff'
  });
}

export async function sendMessageNotification(
  senderId: string,
  recipientUserId: string,
  recipientRole: string,
  senderName: string,
  messagePreview: string,
  chatId: string,
  senderAvatar?: string
) {
  await notificationService.create({
    senderId,
    recipientUserId,
    recipientRole: recipientRole as any,
    title: `💬 ${senderName}`,
    message: messagePreview,
    type: 'message',
    entityId: chatId,
    avatarUrl: senderAvatar
  });
}

export async function sendReferralNotification(
  senderId: string,
  recipientUserId: string,
  recipientRole: string,
  senderName: string,
  company: string,
  referralId: string,
  senderAvatar?: string
) {
  await notificationService.create({
    senderId,
    recipientUserId,
    recipientRole: recipientRole as any,
    title: `🤝 New Referral Request`,
    message: `${senderName} sent you a referral request for ${company}`,
    type: 'referral',
    entityId: referralId,
    avatarUrl: senderAvatar
  });
}
