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

const images = require.context('../images/img', false, /\.(png|jpe?g|svg)$/);
const getImage = (name) => (images(`./${name}`)) // to get a specific image by name
function Index() {
	const isMobile = useIsMobile();
	return (
		<div>
			<div className='container-fluid px-xl-5'
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
					{/* Carousel */}
					<Carousel getImage={getImage} />
					{/* Categories */}
					{/* <Categories getImage={getImage} /> */}
					{/* Products */}
					<Products getImage={getImage} />
					
					{/* <!-- Contact Javascript File --> */}
					{/* <script src="mail/jqBootstrapValidation.min.js"></script>
					<script src="mail/contact.js"></script> */}

					{/* <!-- Template Javascript --> */}
					{/* <script src="js/main.js"></script> */}
					{/* </div> */}
				</div>
			</div>
			{/* Footer */}
			<Footer getImage={getImage}/>
			{/* <!-- Back to Top --> */}
			<a href="##" className="btn btn-primary back-to-top"><i className="fa fa-angle-double-up"></i></a>

		</div>
	)
}
export { Index }
