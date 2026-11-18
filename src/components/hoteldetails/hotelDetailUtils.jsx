import React from "react";
import {
  Crown,
  Bed,
  Wine,
  WifiIcon,
  Thermometer,
  TvIcon,
  CoffeeIcon,
  Microwave,
  ShowerHead,
  Key,
  Bath,
  UtensilsCrossed,
  DoorOpen,
  Sparkle,
} from "lucide-react";
import { BiFridge } from "react-icons/bi";

export const getBedIcon = (bedType) => {
  if (bedType?.toLowerCase().includes("king"))
    return <Crown size={14} className="text-amber-500" />;
  if (bedType?.toLowerCase().includes("queen"))
    return <Crown size={14} className="text-amber-500" />;
  return <Bed size={14} className="text-teal-600" />;
};

export const getAmenityIcon = (amenityName) => {
  const iconMap = {
    Minibar: Wine,
    WiFi: WifiIcon,
    "Air Conditioning": Thermometer,
    TV: TvIcon,
    "Coffee machine": CoffeeIcon,
    Microwave: Microwave,
    Refrigerator: BiFridge,
    Hairdryer: ShowerHead,
    Slippers: Key,
    "Private bathroom": Bath,
    Shower: ShowerHead,
    "Satellite channels": TvIcon,
    Kitchenette: UtensilsCrossed,
    "Private entrance": DoorOpen,
  };
  return iconMap[amenityName] || Sparkle;
};
