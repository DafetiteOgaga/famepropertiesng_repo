// import 'react-country-state-city/dist/react-country-state-city.css';
import './App.css';
import './css/style.css';
import './css/responsive.css';
import './css/animation.css';
// import './css/animations.css';
import './css/reduced-motion.css';
// import './css/test.css'
// import { useLogMediaSize } from './hooks/mediaSize';
import { AppRoutes } from './routes/route';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDeviceType } from './hooks/deviceType';

function App() {
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
