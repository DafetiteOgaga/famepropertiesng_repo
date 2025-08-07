import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Contact } from '../components/contact';
import { Home } from '../components/home';
import { Index } from '../components';
import { Cart } from '../components/cart';
import { Checkout } from '../components/checkout';
import { PageNotFound } from '../components/pageNotFound';

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Index />}>
				{/* This makes Home the default route */}
				<Route index element={<Home />} />
				
				{/* Other routes from Outlet in Index */}
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
