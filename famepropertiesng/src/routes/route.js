import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Contact } from '../components/contact';
import { Home } from '../components/home';
import { Index } from '../components';
import { Cart } from '../components/cart';
import { Checkout } from '../components/checkout';
import { Detail } from '../components/detail';
import { PageNotFound } from '../components/pageNotFound';
import { Products } from '../components/products/products';
import { LogIn } from '../components/loginSignUpProfile/login';
import { SignUp } from '../components/loginSignUpProfile/signUpSetup/signUp';
import { AdminPage } from '../components/addProduct';
import { ProcessImage } from '../components/downloadAndCrop';
import { Welcome } from '../components/welcome';
import { Profile } from '../components/loginSignUpProfile/profileSetup/profile';
import { StoreSignUp } from '../components/loginSignUpProfile/store/storeSignup';
import { PostProduct } from '../components/products/postProducts';

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Index />}>
				{/* This makes Home the default route */}
				<Route index element={<Home />} />
				
				{/* Other routes from Outlet in Index */}
				{/* products */}
				<Route path="products/:productname" element={<Products />} />
				{/* products/detail */}
				<Route path="products/:productname/detail" element={<Detail />} />
				{/* detail */}
				<Route path="detail/:id" element={<Detail />} />
				{/* AddProduct */}
				<Route path="admin-page" element={<AdminPage />} />
				{/* process image page */}
				<Route path="process-image" element={<ProcessImage />} />
				{/* cart */}
				<Route path="cart" element={<Cart />} />
				{/* store sign up */}
				<Route path="store-sign-up/:id" element={<StoreSignUp />} />
				{/* welcome */}
				<Route path="welcome" element={<Welcome />} />
				{/* post product from store */}
				<Route path="post-products/:id" element={<PostProduct />} />
				{/* profile */}
				<Route path="profile" element={<Profile />} />
				{/* log in */}
				<Route path="login" element={<LogIn />} />
				{/* sign up */}
				<Route path="signup" element={<SignUp />} />
				{/* checkout */}
				<Route path="cart/checkout" element={<Checkout />} />
				{/* contact us */}
				<Route path="contact" element={<Contact />} />
				{/* page not found */}
				<Route path="*" element={<PageNotFound />} />
			</Route>
		</Routes>
	);
}

export {AppRoutes};
