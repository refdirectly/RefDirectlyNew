import notificationService from '../services/notificationService';

// Example: When job seeker applies to a job
export const onJobApplication = async (applicationData: any) => {
  // Notify referrer
  await notificationService.create({
    recipientUserId: applicationData.referrerId,
    recipientRole: 'referrer',
    title: 'New Application Received',
    message: `${applicationData.seekerName} applied for ${applicationData.jobTitle}`,
    type: 'application',
    entityId: applicationData.applicationId
  });

  // Notify seeker
  await notificationService.create({
    recipientUserId: applicationData.seekerId,
    recipientRole: 'seeker',
    title: 'Application Submitted',
    message: `Your application for ${applicationData.jobTitle} has been submitted successfully`,
    type: 'application',
    entityId: applicationData.applicationId
  });
};

// Example: When interview is scheduled
export const onInterviewScheduled = async (interviewData: any) => {
  await notificationService.create({
    recipientUserId: interviewData.seekerId,
    recipientRole: 'seeker',
    title: 'Interview Scheduled',
    message: `Interview scheduled for ${interviewData.jobTitle} on ${interviewData.date}`,
    type: 'interview',
    entityId: interviewData.interviewId
  });
};

// Example: When application status changes
export const onStatusUpdate = async (statusData: any) => {
  await notificationService.create({
    recipientUserId: statusData.seekerId,
    recipientRole: 'seeker',
    title: 'Application Status Updated',
    message: `Your application for ${statusData.jobTitle} is now ${statusData.status}`,
    type: 'status_update',
    entityId: statusData.applicationId
  });
};

// Example: Admin broadcast
export const sendAdminBroadcast = async (message: string) => {
  await notificationService.broadcastToRole('seeker', 'System Announcement', message);
  await notificationService.broadcastToRole('referrer', 'System Announcement', message);
};
