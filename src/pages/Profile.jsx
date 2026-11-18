import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { tokenService } from "../services/auth/tokenService.js";
import { authSession, normalizeUser } from "../services/authSession";
import LogOutPopModal from "../components/LogOutPopModal";
import CoTravellersManager from "../components/user/CoTravellersManager";
import CustomerCareSection from "../components/quotes/CustomerCareSection";
import Bookings from "../components/Bookings";
import {
  Edit,
  ImageUp,
  User,
  Users,
  LogOut,
  CheckCircle2,
  Headphones,
  UserCheck,
  Shield,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import CommonHeader from "../components/CommonHeader";
// import ThemeToggle from "../components/ThemeToggle";
// import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import { UserAPI } from "../configs/api";
import { updateUserProfile } from "../components/reducer/AuthSlice";
import authService from "../services/authService";
import travellerService from "../services/travellerService";
import {
  INTERNATIONAL_AIRPORTS,
  findNearestAirportByQuery,
  findNearestAirportByCoords,
  getSavedUserLocation,
  saveUserLocation,
  reverseGeocodeCoords,
  KNOWN_CITIES_DATA,
} from "../utils/airportLocator";

const PROFILE_MENU = [
  { key: "profile", label: "My Profile", icon: User },
  { key: "my-bookings", label: "My Bookings", icon: Calendar },
  { key: "customer-care", label: "Customer Care", icon: Headphones },
  { key: "co-travellers", label: "Co-Travellers", icon: Users },
];

const extractFirstAndLastName = (userObj) => {
  if (!userObj || typeof userObj !== "object") return { firstName: "", lastName: "" };
  let first = userObj.firstName || userObj.first_name || userObj.given_name || "";
  let last = userObj.lastName || userObj.last_name || userObj.family_name || "";

  if ((!first || !last) && userObj.name && typeof userObj.name === "string") {
    const parts = userObj.name.trim().split(/\s+/);
    if (!first && parts.length > 0) first = parts[0];
    if (!last && parts.length > 1) last = parts.slice(1).join(" ");
  }
  return { firstName: first, lastName: last };
};

const formatDob = (val) => {
  if (!val) return "";
  try {
    return String(val).split("T")[0];
  } catch {
    return "";
  }
};

const ProfileSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [primaryTravellerId, setPrimaryTravellerId] = useState(null);
  const [primaryTraveller, setPrimaryTraveller] = useState(null);
  const dispatch = useDispatch();
  // const { theme } = useTheme();

  const authUser = useSelector((state) => state.auth.user);
  const storedUser = (() => {
    try {
      return (
        tokenService.getUserProfile() ||
        JSON.parse(localStorage.getItem("maqam_auth_user")) ||
        JSON.parse(localStorage.getItem("user")) ||
        null
      );
    } catch {
      return null;
    }
  })();
  const currentUser = authUser || storedUser;

  const [profileData, setProfileData] = useState(() => {
    const saved = getSavedUserLocation();
    const u = currentUser;
    const { firstName: first, lastName: last } = extractFirstAndLastName(u);
    const fullName = [first, last].filter(Boolean).join(" ") || u?.name || "";

    return {
      firstName: first,
      lastName: last,
      name: fullName,
      email: u?.email || "",
      phone: u?.phone || u?.phoneNumber || u?.mobile || "",
      dateOfBirth: formatDob(u?.dateOfBirth || u?.dob || u?.birthDate),
      gender: u?.gender || "Male",
      maritalStatus: u?.maritalStatus || "Single",
      anniversaryDate: formatDob(u?.anniversaryDate),
      nationality: u?.nationality || "India",
      addressLine1: saved.addressLine1 || u?.addressLine1 || "",
      addressLine2: saved.addressLine2 || u?.addressLine2 || "",
      city: saved.city || u?.city || "",
      state: saved.state || u?.state || "",
      zipCode: saved.zipCode || u?.zipCode || "",
      country: saved.country || u?.country || "India",
      originAirport: saved.originAirport || u?.originAirport || "DEL",
      originAirportName:
        saved.originAirportName || "Indira Gandhi International Airport",
      about: u?.about || "",
      avatar:
        u?.avatar ||
        u?.profilePicture ||
        "https://images.unsplash.com/photo-1776943340398-67524b7bcf7f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    };
  });

  // Calculate current nearest airport based on city or selected airport
  const currentNearestAirport = useMemo(() => {
    if (profileData.originAirport) {
      const match = INTERNATIONAL_AIRPORTS.find(
        (a) =>
          a.iataCode.toUpperCase() === profileData.originAirport.toUpperCase(),
      );
      if (match) return match;
    }
    return findNearestAirportByQuery(profileData.city || "Delhi");
  }, [profileData.originAirport, profileData.city]);

  useEffect(() => {
    if (!currentUser) return;
    const { firstName: first, lastName: last } = extractFirstAndLastName(currentUser);
    const fullName = [first, last].filter(Boolean).join(" ") || currentUser.name || "";

    setProfileData((prev) => ({
      ...prev,
      firstName: first || prev.firstName,
      lastName: last || prev.lastName,
      name: fullName || prev.name,
      email: currentUser.email || prev.email,
      phone: currentUser.phone || currentUser.phoneNumber || prev.phone,
      gender: currentUser.gender || prev.gender,
      dateOfBirth: formatDob(currentUser.dateOfBirth || currentUser.dob) || prev.dateOfBirth,
      maritalStatus: currentUser.maritalStatus || prev.maritalStatus,
      anniversaryDate: formatDob(currentUser.anniversaryDate) || prev.anniversaryDate,
      nationality: currentUser.nationality || prev.nationality,
      avatar: currentUser.avatar || currentUser.profilePicture || prev.avatar,
    }));
  }, [currentUser]);

  // Load latest authenticated user profile from backend on mount
  useEffect(() => {
    let isMounted = true;
    const loadRemoteProfile = async () => {
      const token = authSession.getAccessToken() || tokenService.getAccessToken();
      const hasSession = Boolean(
        token ||
        tokenService.hasSession() ||
        currentUser ||
        localStorage.getItem("maqam_customer_token") ||
        localStorage.getItem("user")
      );
      if (!hasSession) return;

      let remoteUser = null;
      try {
        remoteUser = await authService.getMe();
        if (remoteUser && isMounted) {
          const normalized = normalizeUser(remoteUser, token);
          dispatch(updateUserProfile(normalized));

          const { firstName: first, lastName: last } = extractFirstAndLastName(remoteUser);
          const fullName = [first, last].filter(Boolean).join(" ") || remoteUser.name || "";

          setProfileData((prev) => ({
            ...prev,
            firstName: first || prev.firstName,
            lastName: last || prev.lastName,
            name: fullName || prev.name,
            email: remoteUser.email || prev.email,
            phone: remoteUser.phone || remoteUser.phoneNumber || remoteUser.mobile || prev.phone,
            gender: remoteUser.gender || prev.gender,
            dateOfBirth: formatDob(remoteUser.dateOfBirth || remoteUser.dob || remoteUser.birthDate) || prev.dateOfBirth,
            maritalStatus: remoteUser.maritalStatus || prev.maritalStatus,
            anniversaryDate: formatDob(remoteUser.anniversaryDate) || prev.anniversaryDate,
            nationality: remoteUser.nationality || prev.nationality,
            avatar: remoteUser.avatar || remoteUser.profilePicture || prev.avatar,
            about: remoteUser.about || prev.about,
          }));
        }
      } catch (err) {
        console.warn(
          "Could not fetch remote user profile on mount:",
          err?.message,
        );
      }

      // Fetch saved traveller profile to hydrate passenger and passport details
      try {
        const travellers = await travellerService.getAllTravellers();
        if (travellers && travellers.length > 0 && isMounted) {
          const userPhoneClean = String(remoteUser?.phone || currentUser?.phone || "")
            .replace(/\D/g, "")
            .slice(-10);
          const userEmailClean = String(remoteUser?.email || currentUser?.email || "")
            .trim()
            .toLowerCase();

          const primary =
            travellers.find((t) => t.isDefault) ||
            travellers.find(
              (t) =>
                (t.phone && String(t.phone).replace(/\D/g, "").slice(-10) === userPhoneClean) ||
                (t.email && String(t.email).trim().toLowerCase() === userEmailClean)
            ) ||
            travellers[0];

          if (primary) {
            setPrimaryTravellerId(primary._id || primary.id);
            setPrimaryTraveller(primary);
            setProfileData((prev) => ({
              ...prev,
              title: primary.title || prev.title || "Mr",
              passengerType:
                primary.passengerType || prev.passengerType || "Adult",
              passportNo: primary.passportNo || primary.passportNumber || prev.passportNo,
              passportIssueDate: formatDob(primary.passportIssueDate) || prev.passportIssueDate,
              passportExpiry: formatDob(primary.passportExpiry) || prev.passportExpiry,
              gender: prev.gender || primary.gender || "Male",
              dateOfBirth: prev.dateOfBirth || formatDob(primary.dateOfBirth) || "",
              nationality: prev.nationality || primary.nationality || "India",
            }));
          }
        }
      } catch (travellerErr) {
        console.warn(
          "Could not load traveller profiles on mount:",
          travellerErr?.message,
        );
      }
    };

    loadRemoteProfile();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => {
    if (
      tabParam &&
      ["profile", "my-bookings", "customer-care", "co-travellers"].includes(tabParam)
    ) {
      return tabParam;
    }
    return "profile";
  });

  useEffect(() => {
    if (
      tabParam &&
      ["profile", "my-bookings", "customer-care", "co-travellers"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [isModalOpen, setModalOpen] = useState(false);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "firstName" || field === "lastName") {
        updated.name =
          `${updated.firstName || ""} ${updated.lastName || ""}`.trim();
      }
      return updated;
    });
  };

  const handleMenuClick = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key }, { replace: true });
  };

  // Handle local avatar photo upload & preview
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result;
      if (base64) {
        setProfileData((prev) => ({ ...prev, avatar: base64 }));
        toast.success(
          "Profile photo preview updated! Click 'Save Changes' to persist.",
        );
        if (!isEditing) setIsEditing(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const firstName = profileData.firstName?.trim() || "";
    const lastName = profileData.lastName?.trim() || "";
    const email = (profileData.email || "").trim();

    if (!firstName) {
      toast.error("First name is required");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const token = authSession.getAccessToken() || tokenService.getAccessToken();
      const hasSession = Boolean(
        token ||
        tokenService.hasSession() ||
        currentUser ||
        localStorage.getItem("maqam_customer_token")
      );
      let serverUser = null;

      if (hasSession) {
        // 1. Account profile (/auth/me) is the source of truth. Fail loudly.
        try {
          serverUser = await authService.updateProfile({
            firstName,
            lastName,
            email,
            phone: profileData.phone,
            gender: profileData.gender,
            avatar: profileData.avatar,
          });
        } catch (authErr) {
          toast.error(
            authErr?.response?.data?.message ||
              authErr?.message ||
              "Failed to update profile",
          );
          return;
        }

        // 2. Traveller record (passport/DOB details). Non-blocking.
        const cleanPhone = String(profileData.phone || "")
          .replace(/\D/g, "")
          .slice(-10);
        if (cleanPhone && firstName) {
          try {
            const travellerPayload = {
              title:
                profileData.title ||
                (profileData.gender === "Female" ? "Ms" : "Mr"),
              firstName,
              lastName: lastName || firstName,
              gender: profileData.gender === "Female" ? "Female" : "Male",
              passengerType: profileData.passengerType || "Adult",
              cellCountryCode: profileData.cellCountryCode || "+91",
              phone: cleanPhone,
              email: email.toLowerCase() || undefined,
              isDefault: true,
            };
            if (profileData.dateOfBirth) {
              travellerPayload.dateOfBirth = new Date(
                profileData.dateOfBirth,
              ).toISOString();
            }
            if (profileData.passportNo?.trim()) {
              travellerPayload.passportNo = profileData.passportNo
                .trim()
                .toUpperCase();
            }
            if (profileData.passportIssueDate) {
              travellerPayload.passportIssueDate = new Date(
                profileData.passportIssueDate,
              ).toISOString();
            }
            if (profileData.passportExpiry) {
              travellerPayload.passportExpiry = new Date(
                profileData.passportExpiry,
              ).toISOString();
            }

            if (primaryTravellerId) {
              await travellerService.updateTraveller(
                primaryTravellerId,
                travellerPayload,
              );
            } else {
              const result =
                await travellerService.ensureTraveller(travellerPayload);
              if (result?.id) {
                setPrimaryTravellerId(result.id);
              }
            }
          } catch (travellerApiErr) {
            console.warn("Traveller profile sync failed:", travellerApiErr);
            toast.warn(
              travellerApiErr?.response?.data?.message ||
                "Profile saved, but traveller details could not be synced",
            );
          }
        }
      }

      // 3. Merge server profile with local travel preferences.
      const updatedUser = {
        ...(currentUser || {}),
        ...(serverUser && typeof serverUser === "object" ? serverUser : {}),
        firstName,
        lastName,
        email,
        originAirport: currentNearestAirport.iataCode,
        originAirportName: currentNearestAirport.airport,
        originCity: currentNearestAirport.name,
      };

      saveUserLocation({
        addressLine1: profileData.addressLine1,
        addressLine2: profileData.addressLine2,
        city: profileData.city || currentNearestAirport.name,
        state: profileData.state,
        zipCode: profileData.zipCode,
        country: profileData.country || currentNearestAirport.country,
        originAirport: currentNearestAirport.iataCode,
        originAirportName: currentNearestAirport.airport,
        originCity: currentNearestAirport.name,
      });
      dispatch(updateUserProfile(updatedUser));

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error.message);
      toast.error("An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <CommonHeader title="Profile Settings" />

      <div className="min-h-screen bg-[#f3f5f7] dark:bg-[#070c18] px-4 pb-10 pt-28 font-poppins transition-colors duration-200">
        <div className="mx-auto max-w-[1200px]">
          <div className="overflow-hidden rounded-[24px] border border-[#edf1f5] dark:border-slate-800 bg-white dark:bg-[#0d1527] shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-colors">
            <div className="flex flex-col lg:flex-row">
              <aside className="w-full bg-[#f8fafc] dark:bg-[#0b1120] p-4 lg:w-[280px] lg:border-r lg:border-[#edf1f5] dark:lg:border-slate-800 lg:p-5 transition-colors">
                <div className="rounded-2xl bg-gradient-to-r from-[#0f6b7b] via-[#0d7c89] to-[#0b5b73] p-4 text-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/60 bg-white/10">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {`${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
                          profileData.name}
                      </p>
                      <p className="text-xs text-cyan-100">
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {PROFILE_MENU.map((item) => {
                    const isActive = activeTab === item.key;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleMenuClick(item.key)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition cursor-pointer ${
                          isActive
                            ? "bg-[#eaf7f8] dark:bg-teal-950/60 text-[#0a6975] dark:text-teal-300 shadow-inner"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                            isActive
                              ? "bg-[#0b6975] text-white"
                              : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <IconComponent size={15} />
                        </span>
                        {item.label}
                      </button>
                    );
                  })}

                  {/* Theme / Appearance Preference (Commented out) */}
                  {/*
                  <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-2xs">
                          {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Theme</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{theme} Mode</p>
                        </div>
                      </div>
                      <ThemeToggle size="sm" />
                    </div>
                  </div>
                  */}

                  {/* Log Out Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300 transition cursor-pointer group"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <LogOut size={15} />
                      </span>
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </aside>

              <main className="flex-1 bg-[#f7f9fb] dark:bg-[#070c18] p-4 sm:p-6 lg:p-7 transition-colors">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0f766e] dark:text-teal-400">
                          Personal Details
                        </p>
                        <h2 className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-slate-900 dark:text-white">
                          My Profile
                        </h2>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* <ThemeToggle /> */}
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b7b] dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d5f6f] dark:hover:bg-teal-700 cursor-pointer"
                          >
                            <Edit size={16} />
                            Edit Profile
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSave}
                              disabled={isLoading}
                              className="rounded-xl bg-[#0f6b7b] dark:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d5f6f] dark:hover:bg-teal-700 disabled:opacity-60 cursor-pointer"
                            >
                              {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-[#e8edf2] dark:border-slate-800 bg-white dark:bg-[#0d1527] p-4 shadow-sm sm:p-5 transition-colors">
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white dark:border-slate-800 bg-gradient-to-br from-[#0d7c89] to-[#0b5a67] shadow-md">
                              <img
                                src={
                                  profileData.avatar ||
                                  "https://images.unsplash.com/photo-1776943340398-67524b7bcf7f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                }
                                alt="profile"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white dark:border-slate-800 bg-[#0f6b7b] dark:bg-teal-600 text-white shadow-md hover:bg-[#0d5f6f] dark:hover:bg-teal-700 transition">
                              <ImageUp size={15} />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                              />
                            </label>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                              Profile Photo
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                              {`${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
                                profileData.name}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#fff4d6] dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 px-3 py-2 text-sm font-medium text-[#876100] dark:text-amber-300">
                          Add your date of birth for a birthday surprise.
                        </div>
                      </div>
                    </div>

                    {/* Primary / Default Traveller Profile Showcase Card */}
                    <div className="rounded-[20px] border border-teal-500/30 dark:border-teal-700/40 bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/30 dark:from-[#0d1527] dark:via-[#0b1120] dark:to-teal-950/20 p-5 shadow-sm transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/60 text-[#0f6b7b] dark:text-teal-400">
                            <UserCheck size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                Primary Traveller Profile
                              </h3>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                <CheckCircle2 size={11} /> Default
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Autofills as lead passenger during flight and hotel checkouts
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab("co-travellers")}
                          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-[#0f6b7b] dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
                        >
                          <Users size={13} />
                          <span>Manage Co-Travellers</span>
                        </button>
                      </div>

                      {primaryTraveller ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                          <div className="rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Full Legal Name
                            </span>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white block mt-0.5">
                              {primaryTraveller.title ? `${primaryTraveller.title}. ` : ""}
                              {primaryTraveller.firstName} {primaryTraveller.lastName}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {primaryTraveller.passengerType || "Adult"} · {primaryTraveller.gender || "Gender"}
                            </span>
                          </div>

                          <div className="rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Contact Details
                            </span>
                            <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5 truncate">
                              <Phone size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                              <span>{primaryTraveller.cellCountryCode || "+91"} {primaryTraveller.phone || "N/A"}</span>
                            </p>
                            <p className="font-medium text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5 truncate">
                              <Mail size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                              <span className="truncate">{primaryTraveller.email || "N/A"}</span>
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Date of Birth &amp; Travel Docs
                            </span>
                            <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                              <Calendar size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                              <span>
                                {primaryTraveller.dateOfBirth
                                  ? new Date(primaryTraveller.dateOfBirth).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "DOB not specified"}
                              </span>
                            </p>
                            {primaryTraveller.passportNo ? (
                              <p className="font-mono text-[11px] text-teal-800 dark:text-teal-300 font-bold mt-1 flex items-center gap-1">
                                <Shield size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                                <span>Passport: {primaryTraveller.passportNo}</span>
                              </p>
                            ) : (
                              <span className="text-[11px] text-slate-400 mt-1 block">
                                Passport details optional
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            No primary traveller profile configured yet. Co-travellers you designate as Primary will appear here for fast autofill.
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab("co-travellers")}
                            className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer shrink-0 ml-3"
                          >
                            Set Up Now →
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[20px] border border-[#e8edf2] dark:border-slate-800 bg-white dark:bg-[#0d1527] p-4 shadow-sm sm:p-5 transition-colors">
                      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                        General Information
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="First Name"
                          type="text"
                          value={profileData.firstName}
                          onChange={(value) =>
                            handleInputChange("firstName", value)
                          }
                          disabled={!isEditing}
                        />
                        <Input
                          label="Last Name"
                          type="text"
                          value={profileData.lastName}
                          onChange={(value) =>
                            handleInputChange("lastName", value)
                          }
                          disabled={!isEditing}
                        />

                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Gender
                          </label>
                          <select
                            value={profileData.gender}
                            onChange={(e) =>
                              handleInputChange("gender", e.target.value)
                            }
                            disabled={!isEditing}
                            className="w-full rounded-xl border border-[#dfe7ee] dark:border-slate-700/80 bg-[#f7fafc] dark:bg-slate-800/80 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-[#0f6b7b] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900/50 dark:disabled:text-slate-500"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) =>
                              handleInputChange("dateOfBirth", e.target.value)
                            }
                            disabled={!isEditing}
                            className="w-full rounded-xl border border-[#dfe7ee] dark:border-slate-700/80 bg-[#f7fafc] dark:bg-slate-800/80 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-[#0f6b7b] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900/50 dark:disabled:text-slate-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Marital Status
                          </label>
                          <select
                            value={profileData.maritalStatus}
                            onChange={(e) =>
                              handleInputChange("maritalStatus", e.target.value)
                            }
                            disabled={!isEditing}
                            className="w-full rounded-xl border border-[#dfe7ee] dark:border-slate-700/80 bg-[#f7fafc] dark:bg-slate-800/80 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-[#0f6b7b] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900/50 dark:disabled:text-slate-500"
                          >
                            <option>Married</option>
                            <option>Single</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Nationality
                          </label>
                          <input
                            type="text"
                            value={profileData.nationality}
                            onChange={(e) =>
                              handleInputChange("nationality", e.target.value)
                            }
                            disabled={!isEditing}
                            className="w-full rounded-xl border border-[#dfe7ee] dark:border-slate-700/80 bg-[#f7fafc] dark:bg-slate-800/80 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-[#0f6b7b] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900/50 dark:disabled:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-[#e8edf2] dark:border-slate-800 bg-white dark:bg-[#0d1527] p-4 shadow-sm sm:p-5 transition-colors">
                      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                        Contact Details
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Mobile Number"
                          type="text"
                          value={profileData.phone}
                          onChange={(value) =>
                            handleInputChange("phone", value)
                          }
                          disabled
                        />
                        <Input
                          label="Email ID"
                          type="email"
                          value={profileData.email}
                          onChange={(value) =>
                            handleInputChange("email", value)
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "my-bookings" && <Bookings embedded />}

                {activeTab === "customer-care" && <CustomerCareSection />}

                {activeTab === "co-travellers" && <CoTravellersManager />}
              </main>
            </div>
          </div>
        </div>
      </div>

      <LogOutPopModal isModalOpen={isModalOpen} setModalOpen={setModalOpen} />
    </>
  );
};

export default ProfileSettings;

/* Reusable Components */

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
  placeholder,
}) => (
  <div>
    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
      {label}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-xl border border-[#dfe7ee] dark:border-slate-700/80 bg-[#f7fafc] dark:bg-slate-800/80 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-[#0f6b7b] dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-900/50 dark:disabled:text-slate-500"
    />
  </div>
);
