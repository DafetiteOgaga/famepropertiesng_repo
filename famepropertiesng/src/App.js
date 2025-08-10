import './App.css';
import './css/style.css';
import './css/responsive.css';
import './css/animation.css';
// import './css/animations.css';
import './css/reduced-motion.css'
// import './css/test.css'
// import { useLogMediaSize } from './hooks/mediaSize';
import { AppRoutes } from './routes/route';

function App() {
  // useLogMediaSize();
  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;
