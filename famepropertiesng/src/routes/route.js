import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Contact } from '../components/contact';
import { Home } from '../components/home';
import { Index } from '../components';
import { Cart } from '../components/checkout/cart';
import { Checkout } from '../components/checkout/checkout';
import { Detail } from '../components/productDetails/detail';
import { PageNotFound } from '../components/pageNotFound';
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

				{/* tests */}
				{/* <Route path="ng" element={<NigeriaLocationPicker />} /> */}
				{/* <Route path="loc" element={<useCountryStateCity />} /> */}

				{/* Other routes from Outlet in Index */}
				{/* products */}
				<Route path="products/:productname" element={<Products />} />
				{/* products/detail */}
				<Route path="products/:productname/detail" element={<Detail />} />
				{/* detail */}
				<Route path="detail/:id" element={<Detail />} />
				<Route path="products/:category/detail/:id" element={<Detail />} />
				{/* edit product */}
				<Route path=":userID/update-product/:productID" element={<EditProduct />} />
				<Route path="products/:category/:userID/update-product/:productID" element={<EditProduct />} />
				{/* admin dashboard */}
				<Route path="profile/admin-dashboard" element={<AdminDashboard />} />
				{/* process image page */}
				<Route path="process-image" element={<ProcessImage />} />
				{/* cart */}
				<Route path="cart" element={<Cart />} />
				{/* store sign up */}
				<Route path="profile/register-store/:id" element={<StoreSignUp />} />
				{/* welcome */}
				<Route path="welcome" element={<Welcome />} />
				{/* checkout success */}
				<Route path="cart/checkout/success" element={<Success />} />
				{/* post product from store */}
				<Route path="post-products/:id" element={<PostProduct />} />
				{/* profile */}
				<Route path="profile" element={<Profile />} />
				{/* installment pay */}
				<Route path="profile/installmental-payment" element={<InstallmentalPayment />} />
				{/* installment pay success */}
				<Route path="profile/installmental-payment/success" element={<Success />} />
				{/* pay on delivery */}
				<Route path="profile/pay-on-delivery" element={<PODelivery />} />
				{/* pay on delivery success */}
				<Route path="profile/pay-on-delivery/success" element={<Success />} />
				{/* store products */}
				<Route path="profile/store-products/:storeID" element={<StoreProducts />} />
				{/* log in */}
				<Route path="login" element={<LogIn />} />
				{/* sign up */}
				<Route path="signup" element={<SignUp />} />
				{/* checkout */}
				<Route path="cart/checkout" element={<Checkout />} />
				{/* contact us */}
				<Route path="contact" element={<Contact />} />
				{/* notifications */}
				<Route path="notifications/:id" element={<Notifications />} />
				{/* staff dashboard */}
				<Route path="staff-dashboard/:id" element={<StaffDashboard />} />
				{/* notification - staff dashboard
				<Route path="staff-dashboard/:id/:nId" element={<StaffDashboard />} /> */}

				{/* page not found */}
				<Route path="*" element={<PageNotFound />} />
			</Route>
		</Routes>
	);
}

export {AppRoutes};
