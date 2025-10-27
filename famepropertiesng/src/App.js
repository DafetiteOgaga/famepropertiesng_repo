import { useEffect } from 'react';
import './App.css';
import './css/style.css';
import './css/responsive.css';
import './css/animation.css';
import './css/reduced-motion.css';
import { AppRoutes } from './routes/route';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDeviceType } from './hooks/deviceType';
import { useGetTotalUsers } from './hooks/getTotalUsers';
import { Toaster } from 'react-hot-toast';
import { usePSPK, useFetchCategories } from './hooks/formMethods/formMethods';
// import { useRequestForFCMToken } from './components/firebaseSetup/firebase-config';

function App() {
  const pspk = usePSPK()
  useFetchCategories()
  // useRequestForFCMToken();
  // console.log({pspk})
  const getTotalUsers = useGetTotalUsers();
  const totalU = sessionStorage.getItem('fpng-tot');
  useEffect(() => {
    if (!totalU) {
      // console.log("Fetching total users...");
      getTotalUsers();
    }
  }, [totalU])

  // useEffect(() => {
  //   console.log("Requesting notification permission...");
  //   console.log("current permission:", Notification.permission);
  //   console.log("current service workers:", navigator.serviceWorker.getRegistrations());
  //   console.log("current path:", process.env.PUBLIC_URL);
  //   // useRequestForFCMToken();
  // }, [])

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

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
        }}
      />



      {/*
      kiqqa
      jenttle
       */}
    </>
  );
}

export default App;


// $ npm install -D purgecss
// $ npx purgecss --css style.css --content "../**/*.js" "../**/*.jsx" --output purged/
