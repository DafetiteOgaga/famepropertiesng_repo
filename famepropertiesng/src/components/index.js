import React, {useState, useEffect} from 'react';
import { Header } from './sections/header';
import { Footer } from './sections/footer';
import { Sidebar } from './bars/sidebar';
import { useDeviceType } from '../hooks/deviceType';
import { Outlet } from 'react-router-dom';
import { useScrollDetection } from '../hooks/scrollDetection';
import { useCreateStorage } from '../hooks/setupLocalStorage';
import { toast } from 'react-toastify';
import { titleCase } from '../hooks/changeCase';

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

	const handleAddToCart = (product, mode='add') => {
		console.log('Adding to cart:', product);

		// array of add/remove
		const addOrRemove = ['add', 'x']

		// array of increase/decrease
		const increaseOrDecrease = ['+', '-']

		// Retrieve/create existing/new cart from localStorage
		const existingCart = createLocal.getItemRaw('fpng-cart');
		let cart = existingCart??[];
		console.log('Existing cart:', cart);

		// Check if product already exists in cart
		// const productID = product.id??product.prdId;
		console.log('Product ID:', product.id);
		const isProductExist = cart?.find(item => item?.prdId === product.id);
		const productIndex = cart?.findIndex(item => item?.prdId === product.id);
		let event
		if (isProductExist) {
			if (mode === 'x') {
				console.log('Product exists in cart, removing item.');
				event = 'removed from'
				// If it exists and mode is x, remove the item
				cart.splice(productIndex, 1);
				// If cart is empty after removal, clear it from localStorage
				if (cart.length === 0) {
					createLocal.removeItem('fpng-cart');
					setNumberOfProductsInCart(0)
					toast.info('Your cart is empty.');
					return;
				}
			} else if (increaseOrDecrease.includes(mode)) {
				if (mode === '+') {
					console.log('Product exists in cart, incrementing quantity.');
					event = 'incremented in'
					// If it exists and mode is +, increment the quantity
					cart[productIndex].nop += 1;
				} else if (mode === '-') {
					console.log('Product exists in cart, decrementing quantity.');
					event = 'decremented in'
					// If it exists and mode is -, decrement the quantity
					if (cart[productIndex].nop > 1) {
						cart[productIndex].nop -= 1;
					} else {
						// If quantity is 1, do nothing
						// cart.splice(productIndex, 1); // remove the item
						event = 'left unchanged in'
						// If cart is empty after removal, clear it from localStorage
						if (cart.length === 0) {
							createLocal.removeItem('fpng-cart');
							setNumberOfProductsInCart(0)
							toast.info('Your cart is empty.');
							return;
						}
					}
				}
			}
			// console.log('Product exists in cart, incrementing quantity.');
			// event = 'incremented in'
			// // If it exists, increment the quantity
			// cart[productIndex].nop += 1;
		} else {
			if (mode === 'x' || mode === '-') {
				console.log('Product does not exist in cart, nothing to remove or decrement.');
				toast.error(`${titleCase(product.name)} is not in your cart.`);
				return;
			} else if (mode === '+' || mode === 'add') {
				console.log('Product does not exist in cart, adding new item with quantity 1.');
				event = 'added to'
				if (mode === 'add') {
					// If it doesn't exist and mode is add, add it with quantity 1
					cart.push({
						prdId: product?.id,
						nop: 1,
						image: product?.image_url_0,
						name: product?.name,
						price: product?.discountPrice,
					});
				} else if (mode === '+') {
					// If it doesn't exist and mode is +, add it with quantity 2
					cart.push({
						prdId: product?.id,
						nop: 2,
						image: product?.image_url_0,
						name: product?.name,
						price: product?.discountPrice,
					});
				}
				// Save updated cart back to localStorage and state
				setNumberOfProductsInCart(cart.length)
				createLocal.setItemRaw('fpng-cart', cart);
				toast.success(`${titleCase(product.name)} has been ${event} your cart.`);
				return;
			} else {
				console.log('Invalid mode provided. Use "add", "x", "+", or "-".');
				toast.error('Invalid action. Please try again.');
				return;
			}
			// console.log('Product does not exist in cart, adding new item.');
			// event = 'added to'
			// // If it doesn't exist, add it with quantity 1
			// cart.push({ prdId: product.id, nop: 1 });
		}

		// Save updated cart back to localStorage and state
		setNumberOfProductsInCart(cart.length)
		createLocal.setItemRaw('fpng-cart', cart);
		toast.success(`${titleCase(product.name)} has been ${event} your cart.`);
		// Optionally, you can provide feedback to the user
		// alert(`${product.name} has been added to your cart.`);
	}
	const handleClearCart = () => {
		createLocal.removeItem('fpng-cart');
		setNumberOfProductsInCart(0)
	}
	const mTop = deviceType.laptop ? '12':deviceType.desktop ?'6':'22.5';
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
