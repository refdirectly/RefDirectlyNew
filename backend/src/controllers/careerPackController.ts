import { Request, Response } from 'express';
import CareerPack from '../models/CareerPack';
import Purchase from '../models/Purchase';

export const getPacks = async (req: Request, res: Response) => {
  try {
    const packs = await CareerPack.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, packs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPack = async (req: Request, res: Response) => {
  try {
    const pack = new CareerPack(req.body);
    await pack.save();
    res.status(201).json({ success: true, pack });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePack = async (req: Request, res: Response) => {
  try {
    const pack = await CareerPack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, pack });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePack = async (req: Request, res: Response) => {
  try {
    await CareerPack.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ success: true, message: 'Pack deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const purchasePack = async (req: Request, res: Response) => {
  try {
    const { packId, paymentId } = req.body;
    const userId = (req as any).user.id;
    
    const pack = await CareerPack.findById(packId);
    if (!pack) return res.status(404).json({ success: false, message: 'Pack not found' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + pack.duration);

    const purchase = new Purchase({
      userId,
      packId,
      amount: pack.discountedPrice,
      paymentId,
      status: 'completed',
      expiresAt
    });

    await purchase.save();
    res.json({ success: true, purchase });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPurchases = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const purchases = await Purchase.find({ userId }).populate('packId').sort({ createdAt: -1 });
    res.json({ success: true, purchases });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
