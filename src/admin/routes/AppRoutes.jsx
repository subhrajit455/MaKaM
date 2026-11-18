import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

// Layouts
import AdminLayout from "../components/layout/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";

// Route Guards
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider as AdminAuthProvider } from "../features/auth/authSlice";

// Authentication
const VerifyOTP = lazy(() => import("../features/auth/pages/VerifyOTP"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPassword"));

// Dashboard
const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));

// CRM Console (unified workspace)
const CrmConsole = lazy(() => import("../features/crm/CrmConsole"));

// Leads & Sales
const Leads = lazy(() => import("../features/leads/pages/Leads"));
const LeadDetails = lazy(() => import("../features/leads/pages/LeadDetails"));
const Pipeline = lazy(() => import("../features/leads/pages/Pipeline"));
const Quotes = lazy(() => import("../features/quotes/pages/Quotes"));

// Packages
const Packages = lazy(() => import("../features/packages/pages/Packages"));
const CreatePackage = lazy(() => import("../features/packages/pages/CreatePackage"));
const EditPackage = lazy(() => import("../features/packages/pages/EditPackage"));
const PackageDetails = lazy(() => import("../features/packages/pages/PackageDetails"));
const CustomPackage = lazy(() => import("../features/packages/pages/CustomPackage"));

// Inventory
const TicketStock = lazy(() => import("../features/inventory/flights/TicketStock"));
const Hotels = lazy(() => import("../features/inventory/hotels/Hotels"));
const HotelsDirectory = lazy(() => import("../features/inventory/hotels/HotelsDirectory"));
const HotelDetailPage = lazy(() => import("../features/inventory/hotels/HotelDetailPage"));
const PendingStock = lazy(() => import("../features/inventory/hotels/PendingStock"));
const ApprovedStock = lazy(() => import("../features/inventory/hotels/ApprovedStock"));
const Offers = lazy(() => import("../features/offers/pages/Offers"));
const VisaDashboard = lazy(() => import("../features/inventory/visa/pages/VisaDashboard"));
const VisaApplications = lazy(() => import("../features/inventory/visa/pages/VisaApplications"));
const VisaApplicationDetails = lazy(() => import("../features/inventory/visa/pages/VisaApplicationDetails"));
const VisaGroups = lazy(() => import("../features/inventory/visa/pages/VisaGroups"));
const VisaGroupDetails = lazy(() => import("../features/inventory/visa/pages/VisaGroupDetails"));
const VisaInventory = lazy(() => import("../features/inventory/visa/pages/VisaInventory"));
const VisaInventoryForm = lazy(() => import("../features/inventory/visa/pages/VisaInventoryForm"));
const VisaInventoryDetails = lazy(() => import("../features/inventory/visa/pages/VisaInventoryDetails"));
const VisaCaseOfficers = lazy(() => import("../features/inventory/visa/pages/VisaCaseOfficers"));

// Bookings
const CreateBooking = lazy(() => import("../features/bookings/pages/CreateBooking"));
const ServiceBooking = lazy(() => import("../features/bookings/pages/ServiceBooking"));
const BookingDetails = lazy(() => import("../features/bookings/pages/BookingDetails"));
const PackageBookingManager = lazy(() => import("../features/bookings/pages/PackageBookingManager"));
const BookingSnapshotPage = lazy(() => import("../features/bookings/pages/BookingSnapshotPage"));
const BookingConfirmation = lazy(() => import("../features/bookings/pages/BookingConfirmation"));

// Customers
const Customers = lazy(() => import("../features/customers/pages/Customers"));
const CustomerDetails = lazy(() => import("../features/customers/pages/CustomerDetails"));

// Finance
const FinanceDashboard = lazy(() => import("../features/finance/pages/FinanceDashboard"));
const Transactions = lazy(() => import("../features/finance/pages/Transactions"));
const InvoicesList = lazy(() => import("../features/finance/pages/InvoicesList"));
// import Refunds from "../features/finance/pages/Refunds"; // Commented out per user request

// Reports
const Reports = lazy(() => import("../features/reports/pages/Reports"));

// Users
const UserDetails = lazy(() => import("../features/users/pages/UserDetails"));
const RolesPermissions = lazy(() => import("../features/users/pages/RolesPermissions"));
const UserManagement = lazy(() => import("../features/users/pages/UserManagement"));

// Profile
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));

// Settings
import SettingsLayout from "../features/settings/components/SettingsLayout";
const GeneralSettings = lazy(() => import("../features/settings/pages/GeneralSettings"));
const HeroBannerSettings = lazy(() => import("../features/settings/pages/HeroBannerSettings"));
const FinancialSettings = lazy(() => import("../features/settings/pages/FinancialSettings"));
const MarkupSettings = lazy(() => import("../features/settings/pages/MarkupSettings"));
const AgencyGstSettings = lazy(() => import("../features/settings/pages/AgencyGstSettings"));
const TaxInvoiceCompliance = lazy(() => import("../features/settings/pages/TaxInvoiceCompliance"));
const BookingSettings = lazy(() => import("../features/settings/pages/BookingSettings"));
const NotificationSettings = lazy(() => import("../features/settings/pages/NotificationSettings"));
const OTPSettings = lazy(() => import("../features/settings/pages/OTPSettings"));
const AuditLogs = lazy(() => import("../features/settings/pages/AuditLogs"));

/**
 * Loading fallback for lazy loaded admin routes
 */
function AdminLoadingFallback() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
        <span className="text-xs font-semibold text-slate-500">Loading module...</span>
      </div>
    </div>
  );
}

/**
 * Temporary placeholder for routes
 * that are planned but not yet implemented.
 */
function Placeholder({ title }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>

      <p className="mt-2 text-sm text-slate-500">
        Reserved for the next development phase.
      </p>
    </div>
  );
}

function CrmRedirect() {
  const { section } = useParams();
  const map = {
    hotels: "/admin/inventory/hotels",
    stock: "/admin/inventory/hotels/stock",
    packages: "/admin/packages",
    bookings: "/admin/bookings",
    staff: "/admin/users",
    customers: "/admin/customers",
    leads: "/admin/leads",
    pipeline: "/admin/pipeline",
    quotes: "/admin/quotes",
  };
  return <Navigate to={map[section] || "/admin/leads"} replace />;
}

/**
 * Admin routes are mounted by App.jsx under <Route path="/admin/*">.
 * All paths below are therefore RELATIVE so they resolve to /admin/...
 * (e.g. "dashboard" -> /admin/dashboard, "administrators/login" ->
 * /admin/administrators/login, matching ProtectedRoute's redirect).
 */
export default function AppRoutes() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<AdminLoadingFallback />}>
        <Routes>
          {/* ============================================================
            AUTH ROUTES  (/admin/administrators/...)
        ============================================================ */}

          <Route element={<AuthLayout />}>
            <Route
              path="administrators/login"
              element={<AdminLogin />}
            />

            <Route path="verify-otp" element={<VerifyOTP />} />

            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* ============================================================
            PROTECTED ADMIN ROUTES  (/admin/...)
        ============================================================ */}

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              {/* Admin root */}
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />

              {/* ========================================================
                CRM WORKSPACE CONSOLE
            ======================================================== */}

              <Route path="crm" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="crm/overview" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="crm/:section" element={<CrmConsole />} />

              {/* ========================================================
                DASHBOARD
            ======================================================== */}

              <Route path="dashboard" element={<Dashboard />} />

              {/* ========================================================
                LEADS & SALES
            ======================================================== */}

              <Route path="leads" element={<Leads />} />
              <Route path="leads/:id" element={<LeadDetails />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="quotes/:id" element={<Quotes />} />

              {/* ========================================================
                PACKAGES
            ======================================================== */}

              <Route path="packages" element={<Packages />} />

              <Route path="packages/create" element={<CreatePackage />} />

              <Route path="packages/custom" element={<CustomPackage />} />

              <Route path="packages/:id/edit" element={<EditPackage />} />

              <Route path="packages/:id" element={<PackageDetails />} />

              {/* ========================================================
                INVENTORY
            ======================================================== */}

              <Route path="inventory/flights" element={<TicketStock />} />

              <Route path="inventory/hotels" element={<HotelsDirectory />} />

              <Route
                path="inventory/hotels/:hotelId"
                element={<HotelDetailPage />}
              />

              <Route path="inventory/hotels/stock" element={<Hotels />} />

              <Route path="inventory/hotels/pending" element={<PendingStock />} />

              <Route
                path="inventory/hotels/approved"
                element={<ApprovedStock />}
              />

              <Route path="offers" element={<Offers />} />

              {/* Cars & insurance: catalogue entries reserved for the inventory
                  explorer dropdown until their modules ship. */}
              <Route
                path="inventory/cars"
                element={<Placeholder title="Cars inventory" />}
              />

              <Route
                path="inventory/insurance"
                element={<Placeholder title="Insurance inventory" />}
              />

              <Route path="visa/dashboard" element={<VisaDashboard />} />
              <Route path="visa/applications" element={<VisaApplications />} />
              <Route path="visa/applications/:id" element={<VisaApplicationDetails />} />
              <Route path="visa/groups" element={<VisaGroups />} />
              <Route path="visa/groups/:id" element={<VisaGroupDetails />} />
              <Route path="visa/case-officers" element={<VisaCaseOfficers />} />
              <Route path="inventory/visa" element={<VisaInventory />} />
              <Route path="inventory/visa/create" element={<VisaInventoryForm />} />
              <Route path="inventory/visa/:id/edit" element={<VisaInventoryForm />} />
              <Route path="inventory/visa/:id" element={<VisaInventoryDetails />} />

              {/* ========================================================
                BOOKINGS
            ======================================================== */}

              <Route path="bookings" element={<PackageBookingManager />} />

              <Route path="bookings/create" element={<CreateBooking />} />

              <Route
                path="bookings/create-service"
                element={<ServiceBooking />}
              />

              <Route
                path="bookings/confirmation"
                element={<BookingConfirmation />}
              />

              <Route
                path="bookings/:id/snapshot"
                element={<BookingSnapshotPage />}
              />

              <Route path="bookings/:id" element={<BookingDetails />} />

              {/* ========================================================
                CUSTOMERS
            ======================================================== */}

              <Route path="customers" element={<Customers />} />

              <Route path="customers/:id" element={<CustomerDetails />} />

              {/* ========================================================
                USERS & STAFF
            ======================================================== */}

              <Route path="users" element={<UserManagement />} />

              <Route path="users/roles" element={<RolesPermissions />} />

              <Route path="users/:id" element={<UserDetails />} />

              {/* ========================================================
                PROFILE
            ======================================================== */}

              <Route path="profile" element={<ProfilePage />} />

              {/* ========================================================
                FINANCE
            ======================================================== */}

              <Route path="finance" element={<FinanceDashboard />} />

              <Route path="finance/transactions" element={<Transactions />} />
              <Route path="finance/invoices" element={<InvoicesList />} />

              {/* <Route path="finance/refunds" element={<Refunds />} /> */}{/* Commented out per user request */}

              {/* ========================================================
                REPORTS
            ======================================================== */}

              <Route path="reports" element={<Reports />} />

              {/* ========================================================
                SETTINGS
            ======================================================== */}

              <Route path="settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="markup" replace />} />
                <Route path="markup" element={<MarkupSettings />} />
                <Route path="agency-gst" element={<AgencyGstSettings />} />
                <Route path="gst" element={<Navigate to="/admin/settings/agency-gst" replace />} />
                <Route path="financial" element={<Navigate to="/admin/settings/markup" replace />} />
                <Route path="general" element={<GeneralSettings />} />
                <Route path="booking" element={<BookingSettings />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route path="invoices" element={<TaxInvoiceCompliance />} />
                <Route path="hero-banner" element={<HeroBannerSettings />} />
                <Route path="otp" element={<OTPSettings />} />
                <Route path="roles" element={<RolesPermissions />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>

              {/* ========================================================
                FUTURE
            ======================================================== */}

              <Route
                path="quotes"
                element={
                  <Placeholder title="Quotes — future Lead/Sales extension" />
                }
              />

              {/* Admin catch-all: unknown /admin paths land on the dashboard */}
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
}
