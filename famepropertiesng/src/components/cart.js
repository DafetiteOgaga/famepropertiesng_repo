import { useState, useEffect } from "react";
import { Breadcrumb } from "./sections/breadcrumb";
import { Link, useNavigate } from 'react-router-dom';
import { useDeviceType } from "../hooks/deviceType";
import { useCreateStorage } from "../hooks/setupLocalStorage";
import { BouncingDots } from "../spinners/spinner";
import { digitSeparator, titleCase } from "../hooks/changeCase";
import { useOutletContext } from 'react-router-dom';

const tableHeadArr = [
	"Products",
	"Name",
	"Price",
	"Quantity",
	"X"
]

function Cart() {
	const navigate = useNavigate();
	const { handleAddToCart } = useOutletContext();
	const { createLocal } = useCreateStorage()
	const deviceType = useDeviceType().width <= 576;
	// const [isImageLoading, setIsImageLoading] = useState({});
	const [loadingImages, setLoadingImages] = useState({});
	// const cartInStorage = createLocal.getItemRaw('fpng-cart')||[]
	const userInfo = createLocal.getItem('fpng-user');
	const [inputValue, setInputValue] = useState([]);
	const [totalAmount, setTotalAmount] = useState(0);
	const [reload, setReload] = useState(false);
	const [isMounting, setIsMounting] = useState(true);

	// console.log({cartInStorage})
	useEffect(() => {
		const cartInStorage = createLocal.getItemRaw('fpng-cart')||[]
		console.log({cartInStorage})
		setInputValue(cartInStorage);
	}, [reload]);

	const handleInputChange = (e, cart, index) => {
		e.preventDefault();
		let value = e.target.value;

		// only allow digits
		if (!/^\d*$/.test(value)) return;

		// handle empty string (let user clear before typing a new number)
		if (value === "") {
			setInputValue(prev => {
				const updated = [...prev];
				updated[index] = { ...updated[index], nop: "" };
				createLocal.setItemRaw("fpng-cart", updated);
				return updated;
			});
			return;
		}

		// parse number and auto-correct 0 → 1
		let newValue = Math.max(1, parseInt(value, 10));

		// update state and localStorage with typed value
		setInputValue(prev => {
			const updated = [...prev];
			updated[index] = { ...updated[index], nop: newValue };
			createLocal.setItemRaw("fpng-cart", updated);
			return updated;
		});
	};

	// on input blur, if empty reset to 1
	const handleInputBlur = (cart, index) => {
		setInputValue(prev => {
			const updated = [...prev];
			let currentValue = updated[index].nop;

			// if user left it empty, reset to 1
			if (currentValue === "" || currentValue === undefined) {
				updated[index] = { ...updated[index], nop: 1 };
				createLocal.setItemRaw("fpng-cart", updated);
			}

			return updated;
		});
	};

	// handles image loading state
	const handleImageLoad = (prdId) => {
		setLoadingImages(prev => ({ ...prev, [prdId]: false }));
	};

	const handleImageStart = (prdId) => {
		setLoadingImages(prev => ({ ...prev, [prdId]: true }));
	};

	const handleStateFuncOnClicks = (prev, index, mode) => {
		let computedCurrVal
		const updated = [...prev];
		if (mode === 'x') {
			// remove item from cart
			updated.splice(index, 1);
		} else {
			const currentValue = updated[index].nop || 1;
			if (mode === '+') {
				computedCurrVal = currentValue + 1;
			} else if (mode === '-') {
				computedCurrVal = currentValue - 1;
			}
			const newValue = Math.max(1, computedCurrVal);
			updated[index] = { ...updated[index], nop: newValue };
		}
		// createLocal.setItemRaw("fpng-cart", updated);
		return updated;
	}
	const currencySym = userInfo?.currencySymbol||'₦'
	const shipping = 1500

	// calculate total amount whenever inputValue changes
	useEffect(() => {
		const total = inputValue.reduce((sum, item) => {
			const price = parseFloat(item.price) || 0;
			const quantity = parseInt(item.nop) || 1;
			return sum + price * quantity;
		}, 0);
		setTotalAmount(total);
	}, [inputValue]);

	// console.log({inputValue});
	// console.log({userInfo})
	// console.log({totalAmount})
	useEffect(() => {
		// flip loading off immediately after mount
		setIsMounting(false);
	}, []);
	return (
		<>
			<Breadcrumb page={'Shopping Cart'} />

			{/* <!-- Cart Start --> */}
			{!isMounting ?
			<div className="container-fluid mt-3"style={{
				paddingLeft: deviceType ? 0 : '',
				paddingRight: deviceType ? 0 : '',
			}}>
				<div className="row px-xl-5">
					<div className="col-lg-8 table-responsive mb-5">
						<table className="table table-light table-borderless table-hover text-center mb-0">
							<thead className="thead-dark">
								<tr>
									{tableHeadArr.map((head, index) => {
										const first = index === 0;
										const last = index === tableHeadArr.length - 1;
										const headKey = head.toLowerCase()
										return (
											<th key={index} className="align-middle"
											style={{
												...first?{borderTopLeftRadius: 8,}:
												last&&{borderTopRightRadius: 8,},
												...deviceType?(
													styles.mobilePadding,
													styles.mobileFontSize):
													{
														width: headKey==='products'?'5%':
																headKey==='name'?'20%':
																headKey==='price'?'5%':
																headKey==='quantity'?'25%':
																headKey==='x'?'10%':'',}}}>
													{head}
											</th>
										)
									})}
								</tr>
							</thead>
							{inputValue.length!==0?
							<tbody className="align-middle">
								{inputValue.map((cart, index) => {
									const isLoading = loadingImages[cart?.prdId]
									// console.log({cart})
									const productMiniDetails = {
										id: inputValue?.[index]?.prdId,
										name: inputValue?.[index]?.name,
									}
									return (
										<tr key={index}>

											{/* image */}
											<td className="align-middle"
											onClick={() => navigate(`/detail/${cart?.prdId}`)}
											style={{
												...deviceType?styles.mobilePadding:{},
												cursor: 'pointer',
												}}>
												{isLoading && (
													<BouncingDots size="ts" color="#475569" p="1" />)}
													<img
													key={cart?.prdId}
													src={cart?.image}
													alt={cart?.name}
													className={`cart-image-img ${isLoading ? 'd-none' : ''}`}
													onLoad={() => handleImageLoad(cart?.prdId)}
													onError={() => handleImageLoad(cart?.prdId)} // stop loader on error too
													onLoadStart={() => handleImageStart(cart?.prdId)}
												/>
											</td>

											{/* product name */}
											<td className="align-middle text-wrap" // text-left"
											onClick={() => navigate(`/detail/${cart?.prdId}`)}
											style={{
												...deviceType?styles.mobilePadding:{},
												cursor: 'pointer',
												}}>{titleCase(cart?.name||'')}</td>

											{/* price */}
											<td className="align-middle text-bg-color text-nowrap"
											style={deviceType?styles.mobilePadding:{}}>
												{currencySym} {digitSeparator(cart?.price?.split('.')[0])}
											</td>

											{/* number of product items with controls */}
											<td className="align-middle"
											style={deviceType?styles.mobilePadding:{}}>
												<div className="input-group quantity mx-auto cart-td-table"
												style={deviceType?styles.mobileQtyWidth:styles.pCQtyWidth}>
													<div className="input-group-btn">
														<button className="btn btn-sm btn-primary btn-minus"
														onClick={() => {
															setInputValue(prev => handleStateFuncOnClicks(prev, index, '-'));
															handleAddToCart(productMiniDetails, '-')
															setReload(prev => !prev)}}>
															<span className="fa fa-minus"></span>
														</button>
													</div>
													<input
													type="text"
													className={`form-control form-control-sm bg-secondary ${deviceType?'':'border-0'} text-center ${deviceType?'w-75 rounded-lg':''}`}
													onChange={(e) => handleInputChange(e, cart, index)}
													onBlur={() => handleInputBlur(cart, index)} // to reset 0 to 1 when click is focused away
													value={inputValue?.[index]?.nop ?? ""}
													/>
													<div className="input-group-btn">
														<button className="btn btn-sm btn-primary btn-plus"
														onClick={() => {
															setInputValue(prev => handleStateFuncOnClicks(prev, index, '+'));
															handleAddToCart(productMiniDetails, '+');
															setReload(prev => !prev)}}>
															<span className="fa fa-plus"></span>
														</button>
													</div>
												</div>
											</td>
											{/* <td className="align-middle">₦{item.total}</td> */}

											{/* delete item button */}
											<td className="align-middle"
											style={deviceType?styles.mobilePadding:{}}>
												<button
												onClick={() => {
													setInputValue(prev => handleStateFuncOnClicks(prev, index, 'x'));
													handleAddToCart(productMiniDetails, 'x');
													setReload(prev => !prev)}}
												className="btn btn-sm btn-danger">
													<i className="fa fa-times"></i>
												</button>
											</td>
										</tr>
									)
								})}
							</tbody>
							:
							<tbody>
								<tr>
									<td colSpan="5" className="text-center font-italic">
										Cart is Empty
									</td>
								</tr>
							</tbody>}
						</table>
					</div>
					<div className="col-lg-4">
						{/* <form className="mb-30" action="">
							<div className="input-group">
								<input type="text" className="form-control border-0 p-4" placeholder="Coupon Code"/>
								<div className="input-group-append">
									<button className="btn btn-primary">Apply Coupon</button>
								</div>
							</div>
						</form> */}
						<h5 className="section-title position-relative text-uppercase mb-3">
							<span className="bg-secondary pr-3"
							style={{color: '#475569'}}>
								Cart Summary
							</span>
						</h5>
						<div className="bg-light p-30 mb-5"
						style={{borderRadius: '10px'}}>
							<div className="border-bottom pb-2">
								<div className="d-flex justify-content-between mb-3">
									<h6>Subtotal</h6>
									<h6>{currencySym} {totalAmount?digitSeparator(totalAmount):'0'}</h6>
								</div>
								<div className="d-flex justify-content-between">
									<h6 className="font-weight-medium">Shipping</h6>
									<h6 className="font-weight-medium">{currencySym} {totalAmount?digitSeparator(shipping):'0'}</h6>
								</div>
							</div>
							<div className="pt-2">
								<div className="d-flex justify-content-between mt-2">
									<h5>Total</h5>
									<h5>{currencySym} {totalAmount?digitSeparator(parseInt(totalAmount)+parseInt(shipping)):'0'}</h5>
								</div>
								<button
								className="btn btn-block btn-primary font-weight-bold my-3 py-3"
								onClick={() => navigate('checkout')}
								disabled={inputValue.length===0}
								>
									Proceed To Checkout
									{/* <Link
									type="button"
									
									to={"checkout"}
									className="btn btn-block btn-primary font-weight-bold my-3 py-3"
									>
										Proceed To Checkout
									</Link> */}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			:
			<BouncingDots size={deviceType?"sm":"lg"} color="#475569" p={deviceType?"10":"14"} />}
		</>
	)
}

const styles = {
	mobilePadding: {
		padding: '0.8rem 0.2rem'
	},
	mobileFontSize: {
		fontSize: '14px',
	},
	mobileQtyWidth: {
		display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
	},
	pCQtyWidth: {
		width: '50%',
	}
}
export { Cart };
