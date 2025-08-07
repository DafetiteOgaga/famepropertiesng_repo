import React  from 'react';
import { TopBar } from './bars/topbar';
import { Header } from './sections/header';
import { Carousel } from './sections/carousel';
import { Features } from './sections/features';
import { Categories } from './sections/categories';
import { Products } from './sections/products';
import { Offer } from './sections/offer';
import { Footer } from './sections/footer';
import { Sidebar } from './bars/sidebar';
import { useIsMobile } from '../hooks/ismobile';
import { Outlet } from 'react-router-dom';
import { Home } from './home';
import { useScrollDetection } from '../hooks/scrollDetection';

const images = require.context('../images/img', false, /\.(png|jpe?g|svg)$/);
const getImage = (name) => (images(`./${name}`)) // to get a specific image by name
function Index() {
	const { lastScrollY } = useScrollDetection(); // using the custom hook to detect scroll and show/hide navbar
	const isMobile = useIsMobile();
	// console.log('lastScrollY:', lastScrollY);
	return (
		<>
			<div className='container-fluid px-xl-5'
			id='top-page'
			// styling dynamically for mobile and desktop - to be resolved later ##########
			style={!isMobile?{
				display: 'grid',
				gridTemplateColumns: '1fr 11fr',
				marginTop: '3%',
				}
				:
				{}}>
				{/* Header */}
				<Header />
				{/* // styling dynamically for mobile and desktop - to be resolved later ########## */}
				{!isMobile && <div>
					{/* sidebar */}
					<Sidebar />
				</div>}
				<div>
					<Outlet />
					{/* Carousel */}
					{/* <Carousel getImage={getImage} /> */}
					{/* Products */}
					{/* <Products getImage={getImage} /> */}
				</div>
			</div>
			{/* Footer */}
			<Footer getImage={getImage}/>
			{/* <!-- Back to Top --> */}
			<button className="back-to-top btn btn-primary"
			style={{display: lastScrollY > 100 ? 'block' : 'none'}}
			onClick={() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
				}}>
				<i className="fa fa-angle-double-up"></i>
			</button>

		</>
	)
}
export { Index }
