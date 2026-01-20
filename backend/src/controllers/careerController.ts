import { Request, Response } from 'express';
import CareerJob from '../models/CareerJob';
import CareerApplication from '../models/CareerApplication';

// Get all active jobs
export const getActiveJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await CareerJob.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
};

// Get all jobs (admin)
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await CareerJob.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
};

// Create job (admin)
export const createJob = async (req: Request, res: Response) => {
  try {
    const job = new CareerJob(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error });
  }
};

// Update job (admin)
export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await CareerJob.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error });
  }
};

// Delete job (admin)
export const deleteJob = async (req: Request, res: Response) => {
  try {
    await CareerJob.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error });
  }
};

// Submit application
export const submitApplication = async (req: Request, res: Response) => {
  try {
    const application = new CareerApplication(req.body);
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting application', error });
  }
};

// Get all applications (admin)
export const getAllApplications = async (req: Request, res: Response) => {
  try {
    const applications = await CareerApplication.find().populate('jobId').sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error });
  }
};

// Update application status (admin)
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const application = await CareerApplication.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error updating application', error });
  }
};
