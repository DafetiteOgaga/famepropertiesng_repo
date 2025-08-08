import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Contact } from '../components/contact';
import { Home } from '../components/home';
import { Index } from '../components';
import { Cart } from '../components/cart';
import { Checkout } from '../components/checkout';
import { Detail } from '../components/detail';
import { PageNotFound } from '../components/pageNotFound';
import { Products } from '../components/sections/products';

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
				<Route path="detail" element={<Detail />} />
				{/* cart */}
				<Route path="cart" element={<Cart />} />
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
