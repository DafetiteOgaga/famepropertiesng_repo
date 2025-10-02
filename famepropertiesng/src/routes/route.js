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
import { AdminPage } from '../components/addProduct';
import { ProcessImage } from '../components/downloadAndCrop';
import { Welcome } from '../components/welcome';
import { Profile } from '../components/loginSignUpProfile/profileSetup/profile';
import { StoreSignUp } from '../components/loginSignUpProfile/store/storeSignup';
import { PostProduct } from '../components/products/postProducts';
import { SingleImageUploader } from '../hooks/backgroundRemover/singleBackgroundRemover';
import { BulkImageUploader } from '../hooks/backgroundRemover/multipleBackgroundRemover';
import { EditProduct } from '../components/products/editProducts';
import { StoreProducts } from '../components/loginSignUpProfile/profileSetup/storeProducts';

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Index />}>
				{/* This makes Home the default route */}
				<Route index element={<Home />} />

				{/* test routes */}
				<Route path="s-img-remover" element={<SingleImageUploader />} />
				<Route path="b-img-remover" element={<BulkImageUploader />} />

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
				{/* AddProduct */}
				<Route path="admin-page" element={<AdminPage />} />
				{/* process image page */}
				<Route path="process-image" element={<ProcessImage />} />
				{/* cart */}
				<Route path="cart" element={<Cart />} />
				{/* store sign up */}
				<Route path="profile/register-store/:id" element={<StoreSignUp />} />
				{/* welcome */}
				<Route path="welcome" element={<Welcome />} />
				{/* post product from store */}
				<Route path="post-products/:id" element={<PostProduct />} />
				{/* profile */}
				<Route path="profile" element={<Profile />} />
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
				{/* page not found */}
				<Route path="*" element={<PageNotFound />} />
			</Route>
		</Routes>
	);
}

export {AppRoutes};
