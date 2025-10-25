import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCreateStorage } from "../hooks/setupLocalStorage";

export function PublicRoute({ children }) {
	const location = useLocation()
	const pathname = useLocation().pathname
	const { createLocal } = useCreateStorage();

	// Retrieve user and location info
	const currentUser = createLocal.getItem('fpng-user');
	console.log("PublicRoute: location =", location);
	console.log("PublicRoute: currentUser.id =", currentUser?.id);

	// Logged in and location is login/signup — redirect to home
	if (currentUser?.id && (pathname === "/login" || pathname === "/signup")) {
		console.log("PublicRoute: User logged in and trying to access login/signup, redirecting to /");
		return <Navigate to="/" replace />;
	}

	// Passed — render the component
	console.log("PublicRoute: Access granted, rendering children");
	return children ? children : <Outlet />;
}
