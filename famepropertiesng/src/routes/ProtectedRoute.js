import React from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useCreateStorage } from "../hooks/setupLocalStorage";

export function ProtectedRoute({ children, requireMatch = false }) {
	const location = useLocation();
	const params = useParams();
	const { createLocal } = useCreateStorage();

	// Retrieve user info
	const currentUser = createLocal.getItem('fpng-user');
	console.log("ProtectedRoute: currentUser =", currentUser);
	console.log("ProtectedRoute: params =", params);
	console.log("ProtectedRoute: requireMatch =", requireMatch);
	console.log("ProtectedRoute: location =", location);
	console.log("ProtectedRoute: children =", children);
	console.log("ProtectedRoute: currentUser.id =", currentUser?.id);
	console.log("ProtectedRoute: type of currentUser.id =", typeof currentUser?.id);

	// Not logged in — redirect to login
	if (!currentUser) {
		console.log("ProtectedRoute: User not logged in, redirecting to /login");
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Masking protection — if route contains a userID param
	if (requireMatch && Object.keys(params).length > 0) {
		console.log("ProtectedRoute: requireMatch is true, checking userID match");
		const loggedUserId = String(currentUser.id);
		const routeUserId = String(params.userID);
		const routeStoreId = String(params.storeID);
		const userStoreID = currentUser?.store?.find(store => String(store.id) === String(routeStoreId))?.id;

		if (loggedUserId !== routeUserId) {
		console.log("ProtectedRoute: User ID mismatch, redirecting to /unauthorized");
		console.warn("Unauthorized access attempt: masking detected!");
		return <Navigate to="/unauthorised" replace />;
		}

		if (routeStoreId && String(userStoreID) !== routeStoreId) {
			console.log("ProtectedRoute: Store ID mismatch, redirecting to /unauthorized");
			console.warn("Unauthorized access attempt: store masking detected!");
			return <Navigate to="/unauthorised" replace />;
		}
	}

	// Passed all checks — render the component
	console.log("ProtectedRoute: Access granted, rendering children");
	return <Outlet />;
}
