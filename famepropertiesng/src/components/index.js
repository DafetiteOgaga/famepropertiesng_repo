import React, {useState, useEffect} from 'react';
import { Header } from './sections/header';
import { Footer } from './sections/footer';
import { Sidebar } from './bars/sidebar';
import { useDeviceType } from '../hooks/deviceType';
import { Outlet } from 'react-router-dom';
import { useScrollDetection } from '../hooks/scrollDetection';
import { useCreateStorage } from '../hooks/setupLocalStorage';
import { toast } from 'react-toastify';

function Index() {
	const [numberOfProductsInCart, setNumberOfProductsInCart] = useState(0)
	// const [isUserDetected, setIsUserDetected] = useState(null)
	const { lastScrollY } = useScrollDetection(); // using the custom hook to detect scroll and show/hide navbar
	const deviceType = useDeviceType();
	const { createLocal } = useCreateStorage()
	// const userIn = createLocal.getItemRaw('fpng-user');
	const productsInCart = createLocal.getItemRaw('fpng-cart');
	useEffect(() => {
		if (productsInCart) {
			const numberOfItems = productsInCart.length
			setNumberOfProductsInCart(numberOfItems)
		}
		// setIsUserDetected(!!userIn)
	}, [])

	const handleAddToCart = (product) => {
		// console.log('Adding to cart:', product);

		// Retrieve existing cart from localStorage
		const existingCart = createLocal.getItemRaw('fpng-cart');
		let cart = existingCart??[];
		// console.log('Existing cart:', cart);

		// Check if product already exists in cart
		const isProductExist = cart.find(item => item.prdId === product.id);
		const productIndex = cart.findIndex(item => item.prdId === product.id);
		if (isProductExist) {
			// console.log('Product exists in cart, incrementing quantity.');
			// If it exists, increment the quantity
			cart[productIndex].nop += 1;
		} else {
			// console.log('Product does not exist in cart, adding new item.');
			// If it doesn't exist, add it with quantity 1
			cart.push({ prdId: product.id, nop: 1 });
		}

		// Save updated cart back to localStorage and state
		setNumberOfProductsInCart(cart.length)
		createLocal.setItemRaw('fpng-cart', cart);
		// toast.success(`${product.name} has been added to your cart.`);
		// Optionally, you can provide feedback to the user
		// alert(`${product.name} has been added to your cart.`);
	}
	const handleClearCart = () => {
		createLocal.removeItem('fpng-cart');
		setNumberOfProductsInCart(0)
	}
	const mTop = deviceType.laptop ? '12':deviceType.desktop ?'6':'22';
	return (
		<>
			<main className='container-fluid px-xl-5'
			id='top-page'
			style={{
				...(deviceType.width>=992) ?
				{
					display: 'grid',
					gridTemplateColumns: '1fr 11fr',
				}
				:
				{},
				marginTop: `${mTop}%`
			}}>
				{/* Header */}
				<Header mTop={mTop}
				numberOfProductsInCart={numberOfProductsInCart}
				// isUserDetected={isUserDetected}
				handleClearCart={handleClearCart} />
				{/* // styling dynamically for mobile and desktop - to be resolved later ########## */}
				{(deviceType.width>=992) &&
					<div>
						{/* sidebar */}
						<Sidebar />
					</div>}
				<div>
					<Outlet context={{ handleAddToCart }} />
				</div>
			</main>
			{/* Footer */}
			<Footer />
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
