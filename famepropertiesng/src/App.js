import './App.css';
import './css/style.css';
import './css/responsive.css';
import './css/animation.css';
// import './css/animations.css';
import './css/reduced-motion.css'
// import './css/test.css'
import { Index } from './components';
import { Navbar } from './components/sections/header';
import { Cart } from './components/cart';
import { Checkout } from './components/checkout';
import { Contact } from './components/contact';
import { Detail } from './components/detail';
import { Shop } from './components/shop';

function App() {
  return (
    <>
      <body>
        {/* <Navbar /> */}
        <Index />
        {/* <Cart /> */}
        {/* <Checkout /> */}
        {/* <Contact /> */}
        {/* <Detail /> */}
        {/* <Shop /> */}
      </body>
    </>
  );
}

export default App;
