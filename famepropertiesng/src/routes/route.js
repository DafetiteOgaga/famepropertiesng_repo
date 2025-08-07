import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Contact } from '../components/contact';
import { Home } from '../components/home';
import { Index } from '../components';

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Index />}>
				{/* This makes Home the default route */}
				<Route index element={<Home />} />
				
				{/* Other routes will replace <Outlet /> */}
				<Route path="contact" element={<Contact />} />
			</Route>
		</Routes>
	);
}

export {AppRoutes};
