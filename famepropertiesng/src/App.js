import { useEffect } from 'react';
// import 'react-country-state-city/dist/react-country-state-city.css';
import './App.css';
import './css/style.css';
import './css/responsive.css';
// import './css/purged/style.css';
// import './css/purged/responsive.css';
import './css/animation.css';
// import './css/animations.css';
import './css/reduced-motion.css';
// import './css/test.css'
// import { useLogMediaSize } from './hooks/mediaSize';
import { AppRoutes } from './routes/route';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDeviceType } from './hooks/deviceType';
import { getTotalUsers } from './hooks/getTotalUsers';
import { getBaseURL } from './hooks/fetchAPIs';
import { useCreateStorage } from './hooks/setupLocalStorage';

const baseURL = getBaseURL();

function App() {
  const { createSession, createLocal } = useCreateStorage()
  const totalU = sessionStorage.getItem('fpng-tot');
  useEffect(() => {
    if (!totalU) {
      console.log("Fetching total users...");
      getTotalUsers();
    }
  }, [totalU])
  // useEffect(() => {
	// 	const handleBeforeUnload = (event) => {
	// 		console.log('Cleaning up local storage before unload...');
	// 		createLocal.removeItem('fpng-prod');
	// 		createLocal.removeItem('fpng-tprd');
	// 	};
	// 	window.addEventListener("beforeunload", handleBeforeUnload);
  //   console.log('product data cleared on mount');
	// 	return () => {
	// 		window.removeEventListener("beforeunload", handleBeforeUnload);
	// 	};
	// }, []);
  const fetchCategories = async (endpoint="categories") => {
		try {
			const categoriesRes = await (fetch(`${baseURL}/${endpoint}/`));
			if (!categoriesRes.ok) {
				throw new Error("Network response was not ok");
			}
			const categoriesData = await categoriesRes.json();
			// setCategoriesOptions(categoriesData);
      console.log('fetched categories:', categoriesData);
			createSession.setItem('fpng-catg', categoriesData);
      return categoriesData;
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
  useEffect(() => {
		const localCategories = localStorage.getItem('fpng-catg');
    console.log({localCategories})
		if (!localCategories?.length) {
			console.log('Fetching categories')
			fetchCategories();
		}
	}, [])
  const deviceType = useDeviceType().width <= 576;
  return (
    <>
      <AppRoutes />
      <ToastContainer
      toastClassName="custom_toast"
      position={deviceType?"top-center":"top-right"}
      autoClose={3000} // 3 seconds (you can increase if needed)
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      // rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      />
      {/*
      frizbe
      everrt
      kiqqa
      jenttle
       */}
    </>
  );
}

export default App;


// $ npm install -D purgecss
// $ npx purgecss --css style.css --content "../**/*.js" "../**/*.jsx" --output purged/
