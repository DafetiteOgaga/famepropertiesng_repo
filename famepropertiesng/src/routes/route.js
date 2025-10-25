import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { Contact } from '../components/contact';
import { Home } from '../components/home';
import { Index } from '../components';
import { Cart } from '../components/checkout/cart';
import { Checkout } from '../components/checkout/checkout';
import { Detail } from '../components/productDetails/detail';
import { PageNotFound } from '../components/pageNotFound';
import { Unauthorised } from '../components/Unauthorised';
import { Products } from '../components/products/products';
import { LogIn } from '../components/loginSignUpProfile/login';
import { SignUp } from '../components/loginSignUpProfile/signUpSetup/signUp';
import { AdminDashboard } from '../components/admin/adminDashboard';
import { ProcessImage } from '../components/downloadAndCrop';
import { Welcome } from '../components/welcome';
import { Profile } from '../components/loginSignUpProfile/profileSetup/profile';
import { StoreSignUp } from '../components/loginSignUpProfile/store/storeSignup';
import { PostProduct } from '../components/products/postProducts';
import { EditProduct } from '../components/products/editProducts';
import { StoreProducts } from '../components/loginSignUpProfile/profileSetup/storeProducts';
import { Success } from '../components/checkout/success';
import { InstallmentalPayment } from '../components/loginSignUpProfile/profileSetup/installmental';
import { PODelivery } from '../components/loginSignUpProfile/profileSetup/pod';
import { StaffDashboard } from '../components/staff/StaffDashboard';
import { Notifications } from '../components/staff/notifications';
// import { NigeriaLocationPicker } from '../hooks/formMethods/nigerianLocations';
// import { useCountryStateCity } from '../hooks/formMethods/locationPicker';

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Index />}>
				{/* This makes Home the default route */}
				<Route index element={<Home />} />

				{/* every other routes are from Outlet in Index */}

				{/* Protected routes (auth + match check) */}
				<Route element={<ProtectedRoute requireMatch />}>
					{/* edit product */}
					<Route path=":userID/:storeID/update-product/:productID" element={<EditProduct />} />
					<Route path="products/:category/:userID/:storeID/update-product/:productID" element={<EditProduct />} />
					{/* admin dashboard */}
					<Route path="profile/:userID/admin-dashboard" element={<AdminDashboard />} />
					{/* process image page */}
					{/* <Route path="process-image" element={<ProcessImage />} /> */}
					{/* store sign up */}
					<Route path="profile/:userID/register-store" element={<StoreSignUp />} />
					{/* post product from store */}
					<Route path="post-products/:userID" element={<PostProduct />} />
					{/* profile */}
					<Route path="profile/:userID" element={<Profile />} />
					{/* installment pay */}
					<Route path="profile/:userID/installmental-payment" element={<InstallmentalPayment />} />
					{/* installment pay success */}
					<Route path="profile/:userID/installmental-payment/success" element={<Success />} />
					{/* pay on delivery */}
					<Route path="profile/:userID/pay-on-delivery" element={<PODelivery />} />
					{/* pay on delivery success */}
					<Route path="profile/:userID/pay-on-delivery/success" element={<Success />} />
					{/* store products */}
					<Route path="profile/:userID/store-products/:storeID" element={<StoreProducts />} />
					{/* notifications */}
					<Route path="notifications/:userID" element={<Notifications />} />
					{/* staff dashboard */}
					<Route path="staff-dashboard/:userID" element={<StaffDashboard />} />
				</Route>

				{/* Protected routes (auth only) */}
				<Route element={<ProtectedRoute />}>
					{/* <Route path="profile" element={<Profile />} /> */}
				</Route>

				{/* Public routes (login and sign up) */}
				<Route element={<PublicRoute />}>
					{/* log in */}
					<Route path="login" element={<LogIn />} />
					{/* sign up */}
					<Route path="signup" element={<SignUp />} />
				</Route>

				{/* other Public routes */}
				{/* products */}
				<Route path="products/:productname" element={<Products />} />
				{/* products/detail */}
				<Route path="products/:productname/detail" element={<Detail />} />
				{/* detail */}
				<Route path="detail/:id" element={<Detail />} />
				<Route path="products/:category/detail/:id" element={<Detail />} />
				{/* cart */}
				<Route path="cart" element={<Cart />} />
				{/* welcome */}
				<Route path="welcome" element={<Welcome />} />
				{/* checkout success */}
				<Route path="cart/checkout/success" element={<Success />} />
				{/* checkout */}
				<Route path="cart/checkout" element={<Checkout />} />
				{/* contact us */}
				<Route path="contact" element={<Contact />} />

				{/* page not found and unauthorised */}
				<Route path="unauthorised" element={<Unauthorised />} />
				<Route path="*" element={<PageNotFound />} />
			</Route>
		</Routes>
	);
}

export {AppRoutes};
