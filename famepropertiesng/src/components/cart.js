import { useState } from "react";
import { Breadcrumb } from "./sections/breadcrumb";
import { Link } from 'react-router-dom';
import { useDeviceType } from "../hooks/deviceType";

const images = require.context('../images/img', false, /\.(png|jpe?g|svg)$/);
const getImage = (name) => (images(`./${name}`)) // to get a specific image by name

const tableHeadArr = [
	"Products",
	"Price",
	"Quantity",
	// "Total",
	"Remove"
]
const cartItemsArray = [
	{
		id: 'one',
		name: "Product Name",
		image: "product-1.jpg",
		price: 150,
		total: 150,
	},
	{
		id: 'two',
		name: "Product Name",
		image: "product-2.jpg",
		price: 150,
		total: 150,
	},
	{
		id: 'three',
		name: "Product Name",
		image: "product-3.jpg",
		price: 150,
		total: 150,
	},
	{
		id: 'four',
		name: "Product Name",
		image: "product-4.jpg",
		price: 150,
		total: 150,
	},
	{
		id: 'five',
		name: "Product Name",
		image: "product-5.jpg",
		price: 150,
		total: 150,
	},
]
function Cart() {
	// const [cartInput, setCartInput] = useState('');
	const deviceType = useDeviceType().width <= 576;
	const [cartItemsArr, setCartItemsArr] = useState(cartItemsArray); // initialItems from props or data
	const [newQuantity, setNewQuantity] = useState(() => {
		const initialQuantities = {};
		cartItemsArr.forEach(item => {
			initialQuantities[item.id] = 1;
		});
		return initialQuantities;
	});
	const handleInputChange = (e, id) => {
		e.preventDefault();
		const { value } = e.target;
		// setCartInput(value);
		setNewQuantity(prev => {
			const updated = { ...prev };
			updated[id] = value ? parseInt(value, 10) : 0; // Ensure it's a number
			return updated;
		});
	}
	const handleNewQuantity = (id, mode) => {
		// console.log({id, mode});
		setNewQuantity(prev => {
			const updated = { ...prev };
			if (mode === '+') {
				updated[id] += 1;
			} else if (mode === '-') {
				updated[id] = Math.max(1, updated[id] - 1);
			}
			return updated;
		});
	};
	const handleRemoveItem = (id) => {
		// remove from cart items
		const updatedCart = cartItemsArr.filter(item => item.id !== id);
		setCartItemsArr(updatedCart); // you'll need to make `cartItemsArr` stateful
		// remove quantity tracking
		setNewQuantity(prev => {
			const updated = { ...prev };
			delete updated[id];
			return updated;
		});
	};
	// console.log({newQuantity});
	return (
		<>
		<Breadcrumb page={'Shopping Cart'} />

		{/* <!-- Cart Start --> */}
		<div className="container-fluid"style={{
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
									return (
										<th key={index} className="align-middle"
										style={
											first?
											{
												borderTopLeftRadius: 8,
											}
										:
											last?
											{
												borderTopRightRadius: 8,
											}
										:{}}>{head}</th>
									)
								})}
							</tr>
						</thead>
						<tbody className="align-middle">
							{cartItemsArr.map((item, index) => {
								return (
									<tr key={index}>
										<td className="align-middle"><img src={getImage(item.image)} alt={item.image} className="cart-image-img"/> {item.name}</td>
										<td className="align-middle">₦{item.price}</td>
										<td className="align-middle">
											<div className="input-group quantity mx-auto cart-td-table">
												<div className="input-group-btn">
													<button className="btn btn-sm btn-primary btn-minus"
													onClick={()=>handleNewQuantity(item.id, '-')}>
													<i className="fa fa-minus"></i>
													</button>
												</div>
												<input
												type="text"
												className="form-control form-control-sm bg-secondary border-0 text-center"
												onChange={(e)=>handleInputChange(e, item.id)}
												value={newQuantity[item.id]}/>
												<div className="input-group-btn">
													<button className="btn btn-sm btn-primary btn-plus"
													onClick={()=>handleNewQuantity(item.id, '+')}>
														<i className="fa fa-plus"></i>
													</button>
												</div>
											</div>
										</td>
										{/* <td className="align-middle">₦{item.total}</td> */}
										<td className="align-middle">
											<button
											onClick={() => handleRemoveItem(item.id)}
											className="btn btn-sm btn-danger">
												<i className="fa fa-times"></i>
											</button>
										</td>
									</tr>
								)
							})}
						</tbody>
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
								<h6>₦150</h6>
							</div>
							<div className="d-flex justify-content-between">
								<h6 className="font-weight-medium">Shipping</h6>
								<h6 className="font-weight-medium">₦10</h6>
							</div>
						</div>
						<div className="pt-2">
							<div className="d-flex justify-content-between mt-2">
								<h5>Total</h5>
								<h5>₦160</h5>
							</div>
							<Link to={"checkout"} className="btn btn-block btn-primary font-weight-bold my-3 py-3">Proceed To Checkout</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
	)
}
export { Cart };
