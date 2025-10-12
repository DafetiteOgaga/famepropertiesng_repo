import { useNavigate } from 'react-router-dom';

function useNavigateToComp() {
	const navigate = useNavigate();

	const navigateTo = (path) => {
		navigate(path);
	};
	return navigateTo;
}
export { useNavigateToComp }

// usage:
// const navigateTo = useNavigateToComp();
// navigateTo('/desired-path');
