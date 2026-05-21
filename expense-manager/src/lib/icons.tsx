import React from "react";
import {
  UtensilsCrossed, Coffee, ShoppingBag, ShoppingCart,
  Receipt, Zap, Droplets, Car, Bus, Fuel,
  Gamepad2, Film, Music, Heart, Stethoscope, Pill,
  GraduationCap, BookOpen, Home, Wrench, Baby,
  Plane, MapPin, Gift, PartyPopper,
  Dumbbell, Bike, Shirt, Glasses, Smartphone, Laptop,
  Shield, Banknote, Wallet, TrendingUp, LineChart as LineChartIcon,
  Briefcase, Building2, Award, Star, Code,
  CircleDot, MoreHorizontal, Scissors, Flower2,
  Dog, Cat, PaintBucket, Sparkles, HandCoins,
  CreditCard, PiggyBank, Landmark, Store, Package,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, Coffee, ShoppingBag, ShoppingCart,
  Receipt, Zap, Droplets, Car, Bus, Fuel,
  Gamepad2, Film, Music, Heart, Stethoscope, Pill,
  GraduationCap, BookOpen, Home, Wrench, Baby,
  Plane, MapPin, Gift, PartyPopper,
  Dumbbell, Bike, Shirt, Glasses, Smartphone, Laptop,
  Shield, Banknote, Wallet, TrendingUp, LineChartIcon,
  Briefcase, Building2, Award, Star, Code,
  CircleDot, MoreHorizontal, Scissors, Flower2,
  Dog, Cat, PaintBucket, Sparkles, HandCoins,
  CreditCard, PiggyBank, Landmark, Store, Package,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP);

export const ICON_GROUPS: { label: string; icons: string[] }[] = [
  {
    label: "Ăn uống",
    icons: ["UtensilsCrossed", "Coffee"],
  },
  {
    label: "Mua sắm",
    icons: ["ShoppingBag", "ShoppingCart", "Store", "Package"],
  },
  {
    label: "Di chuyển",
    icons: ["Car", "Bus", "Fuel", "Bike"],
  },
  {
    label: "Hóa đơn",
    icons: ["Receipt", "Zap", "Droplets", "CreditCard"],
  },
  {
    label: "Giải trí",
    icons: ["Gamepad2", "Film", "Music", "Sparkles"],
  },
  {
    label: "Sức khỏe & Thể thao",
    icons: ["Heart", "Stethoscope", "Pill", "Dumbbell"],
  },
  {
    label: "Giáo dục",
    icons: ["GraduationCap", "BookOpen"],
  },
  {
    label: "Nhà cửa & Gia đình",
    icons: ["Home", "Wrench", "Baby", "Dog", "Cat"],
  },
  {
    label: "Thời trang & Làm đẹp",
    icons: ["Shirt", "Glasses", "Scissors", "Flower2", "PaintBucket"],
  },
  {
    label: "Công nghệ",
    icons: ["Smartphone", "Laptop", "Code"],
  },
  {
    label: "Du lịch & Quà",
    icons: ["Plane", "MapPin", "Gift", "PartyPopper"],
  },
  {
    label: "Tài chính",
    icons: ["Banknote", "Wallet", "TrendingUp", "HandCoins", "PiggyBank", "Landmark"],
  },
  {
    label: "Công việc",
    icons: ["Briefcase", "Building2", "Award", "Star"],
  },
  {
    label: "Bảo hiểm & Khác",
    icons: ["Shield", "CircleDot", "MoreHorizontal"],
  },
];

export function CategoryIcon({
  name,
  className = "h-4 w-4",
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <CircleDot className={className} />;
  return <Icon className={className} />;
}
