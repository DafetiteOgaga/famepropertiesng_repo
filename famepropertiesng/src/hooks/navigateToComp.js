import { useNavigate } from 'react-router-dom';

function NavigateToComp() {
	const navigate = useNavigate();
	
	const navigateTo = (path) => {
		navigate(path);
	};

	return { navigateTo };
}
export { NavigateToComp }

// usage:
// const navigateTo = NavigateToComp();
// navigateTo('/desired-path');
