import { z } from "zod";

export const orderSchema = z.object({
  buyerName:       z.string().min(2).max(100),
  buyerPhone:      z.string().min(9).max(15).regex(/^[0-9+\-\s]+$/),
  buyerEmail:      z.string().email().optional().or(z.literal("")),
  deliveryAddress: z.string().min(10).max(500),
  notes:           z.string().max(300).optional(),
  items:           z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })).min(1),
});

export const reviewSchema = z.object({
  productId:  z.string(),
  buyerName:  z.string().min(2).max(100),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  rating:     z.number().int().min(1).max(5),
  comment:    z.string().min(5).max(1000),
});

export const productSchema = z.object({
  name:         z.string().min(2).max(200),
  slug:         z.string().min(2).max(200),
  description:  z.string().min(5).max(500),
  longDesc:     z.string().max(2000).optional(),
  price:        z.number().min(0),
  comparePrice: z.number().min(0).optional().nullable(),
  unit:         z.string().min(1).max(50),
  stock:        z.number().int().min(0),
  category:     z.string().min(1),
  images:       z.array(z.string()).min(1).max(8),
  featured:     z.boolean().default(false),
  isActive:     z.boolean().default(true),
  sortOrder:    z.number().int().default(0),
});

export const settingsSchema = z.object({
  storeName:      z.string().min(1).max(100),
  tagline:        z.string().max(200).optional(),
  ownerName:      z.string().max(100).optional(),
  ownerPhone:     z.string().max(20).optional(),
  ownerEmail:     z.string().max(100).optional(),
  whatsappNumber: z.string().max(20).optional(),
  address:        z.string().max(300).optional(),
  openingHours:   z.string().max(100).optional(),
  facebook:       z.string().max(200).optional(),
  instagram:      z.string().max(200).optional(),
  tiktok:         z.string().max(200).optional(),
  deliveryNote:   z.string().max(200).optional(),
  minOrderNote:   z.string().max(200).optional(),
  aboutText:      z.string().max(2000).optional(),
  heroImages:     z.array(z.string()).optional(),
});
