import { createBrowserRouter } from "react-router"
import AdminLayout from "./components/layouts/AdminLayout"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import GuestRoute from "./components/auth/GuestRoute"
import Dashboard from "./pages/Dashboard"
import ProductList from "./pages/Products/ProductList"
import ProductForm from "./pages/Products/ProductForm"
import CategoryList from "./pages/Categories/CategoryList"
import CategoryForm from "./pages/Categories/CategoryForm"
import MediaList from "./pages/Media/MediaList"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import VerifyOtp from "./pages/VerifyOtp"
import ResetPassword from "./pages/ResetPassword"
import OrdersList from "./pages/Orders/OrdersList"
import OrderDetail from "./pages/Orders/OrderDetail"
import UsersList from "./pages/Users/UsersList"
import ProfilePage from "./pages/Profile/ProfilePage"
import ChangePassword from "./pages/Profile/ChangePassword"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <GuestRoute>
        <ForgotPassword />
      </GuestRoute>
    ),
  },
  {
    path: "/verify-otp",
    element: (
      <GuestRoute>
        <VerifyOtp />
      </GuestRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <GuestRoute>
        <ResetPassword />
      </GuestRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products", element: <ProductList /> },
      { path: "products/new", element: <ProductForm /> },
      { path: "products/:id/edit", element: <ProductForm /> },
      { path: "categories", element: <CategoryList /> },
      { path: "categories/new", element: <CategoryForm /> },
      { path: "categories/:id/edit", element: <CategoryForm /> },
      { path: "media", element: <MediaList /> },
      { path: "orders", element: <OrdersList /> },
      { path: "orders/:id", element: <OrderDetail /> },
      { path: "users", element: <UsersList /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/change-password", element: <ChangePassword /> },
    ],
  },
])
