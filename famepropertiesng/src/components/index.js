import React  from 'react';
import { TopBar } from './bars/topbar';
import { Navbar } from './bars/navbar';
import { Carousel } from './sections/carousel';
import { Features } from './sections/features';
import { Categories } from './sections/categories';
import { Products } from './sections/products';
import { Offer } from './sections/offer';
import { Footer } from './sections/footer';

const images = require.context('../images/img', false, /\.(png|jpe?g|svg)$/);
const getImage = (name) => (images(`./${name}`)) // to get a specific image by name
function Index() {
	return (
		<>
			{/* Topbar */}
			<TopBar />

			{/* Navbar */}
			<Navbar />

			{/* Carousel */}
			<Carousel getImage={getImage} />

			{/* Feature */}
			<Features />

			{/* Categories */}
			<Categories getImage={getImage} />

			{/* Products */}
			<Products getImage={getImage} />

			{/* Offer */}
			{/* <Offer getImage={getImage} /> */}

			{/* Footer */}
			<Footer getImage={getImage}/>

			{/* <!-- Back to Top --> */}
			<a href="##" className="btn btn-primary back-to-top"><i className="fa fa-angle-double-up"></i></a>


			{/* <!-- JavaScript Libraries --> */}
			{/* <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
			<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js"></script>
			<script src="lib/easing/easing.min.js"></script>
			<script src="lib/owlcarousel/owl.carousel.min.js"></script> */}

			{/* <!-- Contact Javascript File --> */}
			{/* <script src="mail/jqBootstrapValidation.min.js"></script>
			<script src="mail/contact.js"></script> */}

			{/* <!-- Template Javascript --> */}
			{/* <script src="js/main.js"></script> */}
		</>
	)
}
export { Index }
