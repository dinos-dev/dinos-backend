import { Schema, Document } from 'mongoose';

// Menu 서브스키마
const MenuSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
  },
  { _id: false },
);

// Section 서브스키마 (section1~section5 공통 구조)
const SectionSchema = new Schema(
  {
    restaurantId: { type: String, required: true },
    storeName: { type: String, required: true },
    description: { type: String, required: true },
    summary: { type: String, required: true },
    address: { type: String, required: true },
    businessHours: { type: String, required: true },
    menus: { type: [MenuSchema], default: [] },
    imageUrls: { type: [String], default: [] },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false },
);

// HomeFeed 스키마
export const FeedSchema = new Schema(
  {
    inputKeyword: { type: String, required: true },
    persona: { type: String, required: true },
    character: { type: String, required: true },
    title: { type: String, required: true },
    intro: { type: String, required: true },
    sections: { type: [SectionSchema], required: true },
    thumbnailUrl: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: 'feeds', timestamps: false },
);

export interface SectionDocument {
  restaurantId: string;
  storeName: string;
  description: string;
  summary: string;
  address: string;
  businessHours: string;
  menus: { name: string; price: string }[];
  imageUrls: string[];
  latitude: number;
  longitude: number;
}

export interface FeedDocument extends Document {
  inputKeyword: string;
  persona: string;
  character: string;
  title: string;
  intro: string;
  thumbnailUrl: string;
  sections: SectionDocument[];
  createdAt: Date;
}
