import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute"; // Route guard for private routes 
import { useSelector } from "react-redux";
import OrderDetails from "@/components/Orders/OrderDetails";
import ForgotPassword from "@/components/Authentication/ForgotPassword/ForgotPassword";
import CustomerProductsPrices from "@/components/Customers/CustomerPrices";

// Lazy load your components for performance
const Home = lazy(() => import("@/components/Home/Home")); // Layout wrapper
const Login = lazy(() => import("@/components/Authentication/Login/Login"));
const Product = lazy(() => import("@/components/Products/Products"));
const CreateProduct = lazy(() => import("@/components/Products/CreateProduct"));
const Customers = lazy(() => import("@/components/Customers/Customers"));
const Orders = lazy(() => import("@/components/Orders/Orders"));
const CreateOrder = lazy(() => import("@/components/Orders/CreateOrder"));
const SetPassword = lazy(() => import("@/components/Authentication/ResetPassword/ResetPassword"));
// const NotFound = lazy(() => import("@/pages/NotFound"));

const AppRoutes: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { isAuthenticated } = useSelector((state: any) => state.auth);
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={isAuthenticated ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/set-password/:id" element={<SetPassword />} />
                <Route path="/reset-password/:id" element={<SetPassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/products" element={<Home><Product /></Home>} />
                    <Route path="/view-product/:id" element={<Home><CreateProduct /></Home>} />
                    <Route path="/edit-product/:id" element={<Home><CreateProduct /></Home>} />
                    <Route path="/create-product" element={<Home><CreateProduct /></Home>} />
                    <Route path="/create-order" element={<Home><CreateOrder /></Home>} />
                    <Route path="/view-order/:id" element={<Home><OrderDetails /></Home>} />
                    <Route path="/customers" element={<Home><Customers /></Home>} />
                    <Route path="/customer-prices/:id" element={<Home><CustomerProductsPrices /></Home>} />
                    <Route path="/orders" element={<Home><Orders /></Home>} />
                </Route>

                {/* Catch-All Route for 404 */}
                {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
