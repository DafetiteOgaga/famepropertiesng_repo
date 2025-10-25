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
	const { lastScrollY, scrollingDown, headerHeight } = useScrollDetection(); // using the custom hook to detect scroll and show/hide navbar
	const deviceType = useDeviceType();
	const { createLocal } = useCreateStorage()
	const productsInCart = createLocal.getItemRaw('fpng-cart');
	useEffect(() => {
		if (productsInCart) {
			const numberOfItems = productsInCart.length
			setNumberOfProductsInCart(numberOfItems)
		}
	}, [])

	const handleAddToCart = (product, mode='add') => {

		// array of add/remove
		// const addOrRemove = ['add', 'x']

		// array of increase/decrease
		const increaseOrDecrease = ['+', '-']

		// Retrieve/create existing/new cart from localStorage
		const existingCart = createLocal.getItemRaw('fpng-cart');
		let cart = existingCart??[];

		// Check if product already exists in cart
		const isProductExist = cart?.find(item => item?.prdId === product.id);
		const productIndex = cart?.findIndex(item => item?.prdId === product.id);
		// let event
		if (isProductExist) {
			if (mode === 'x') {
				// event = 'removed from'
				// If it exists and mode is x, remove the item
				cart.splice(productIndex, 1);
				// If cart is empty after removal, clear it
				if (cart.length === 0) {
					createLocal.removeItem('fpng-cart');
					setNumberOfProductsInCart(0)
					toast.info('Your cart is empty.');
					return;
				}
			} else if (increaseOrDecrease.includes(mode)) {
				if (mode === '+') {
					// event = 'incremented in'
					if (cart[productIndex].nop < cart[productIndex].totalAvailable) {
						// If it exists and mode is +, increment the quantity
						cart[productIndex].nop += 1;
					}
				} else if (mode === '-') {
					// event = 'decremented in'
					// If it exists and mode is -, decrement the quantity
					if (cart[productIndex].nop > 1) {
						cart[productIndex].nop -= 1;
					} else {
						// If quantity is 1, do nothing
						// event = 'left unchanged in'
						// If cart is empty after removal, clear it
						if (cart.length === 0) {
							createLocal.removeItem('fpng-cart');
							setNumberOfProductsInCart(0)
							toast.info('Your cart is empty.');
							return;
						}
					}
				}
			}
		} else {
			if (mode === 'x' || mode === '-') {
				toast.error(`${titleCase(product.name)} is not in your cart.`);
				return;
			} else if (mode === '+' || mode === 'add') {
				// event = 'added to'
				if (mode === 'add') {
					// If it doesn't exist and mode is add, add it with quantity 1
					cart.push({
						prdId: product?.id,
						nop: 1,
						totalAvailable: product?.numberOfItemsAvailable,
						image: product?.image_url_0,
						name: product?.name,
						price: product?.discountPrice,
						thumbnail: product?.thumbnail_url_0
					});
				} else if (mode === '+') {
					// If it doesn't exist and mode is +, add it with quantity 2
					const totalIsGreaterThan1 = parseInt(product?.numberOfItemsAvailable)>1
					cart.push({
						prdId: product?.id,
						nop: totalIsGreaterThan1? 2 : 1,
						totalAvailable: product?.numberOfItemsAvailable,
						image: product?.image_url_0,
						name: product?.name,
						price: product?.discountPrice,
						thumbnail: product?.thumbnail_url_0
					});
				}
				// Save updated cart back to localStorage and state
				setNumberOfProductsInCart(cart.length)
				createLocal.setItemRaw('fpng-cart', cart);
				return;
			} else {
				toast.error('Invalid action. Please try again.');
				return;
			}
		}

		// Save updated cart back to localStorage and state
		setNumberOfProductsInCart(cart.length)
		createLocal.setItemRaw('fpng-cart', cart);
	}
	const handleClearCart = () => {
		createLocal.removeItem('fpng-cart');
		setNumberOfProductsInCart(0)
	}

	const mTop = scrollingDown ? headerHeight : 40 // deviceType.laptop ? '12':deviceType.desktop ?'4':'19.5';
	// console.log({mTop, scrollingDown, lastScrollY})
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
				marginTop: (mTop + 5)
			}}>
				{/* Header */}
				<Header mTop={mTop}
				numberOfProductsInCart={numberOfProductsInCart}
				handleClearCart={handleClearCart} />
				{/* // styling dynamically for mobile and desktop - to be resolved later ########## */}
				{(deviceType.width>=992) &&
					<div>
						{/* sidebar */}
						<Sidebar />
					</div>}
				<div>
					<Outlet context={{ handleAddToCart, handleClearCart }} />
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
