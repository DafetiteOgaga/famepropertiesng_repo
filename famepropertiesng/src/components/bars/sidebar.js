import { Link } from 'react-router-dom';

const categoriesOptionsArr = [
	'Beds/Mattresses',
	'Wardrobes/Dressers',
	'TVs/Monitors',
	'Sound Systems',
	'Gas Cookers',
	'Refrigerators/Freezers',
	'Microwaves/Ovens',
	'Fans/Air Conditioners',
	'Clothing/Shoes',
	'Kitchenware',
	'Tables/Chairs',
	'Sofas/Couches',
	'Generators/Inverters',
	'Books/Stationery',
	'Phones/Accessories',
	'Computers/Tablets',
	'Toys/Baby Gear',
	'Fitness Equipment',
	'Decor/Wall Art',
	'Bags/Luggage'
]
function Sidebar() {
	return (
		<div style={{position: 'sticky', top: '5%'}}>
			<h3 className="text-uppercase pr-1">Categories</h3>
			<nav className="navbar navbar-light p-0" id="navbar-vertical">
				<div className="navbar-nav w-100">
					{categoriesOptionsArr.map((option, index) => {
						return (
							<Link key={index} to="" className="nav-item nav-link">{option}</Link>
						)})}
				</div>
			</nav>
		</div>
	)
}
export { Sidebar };
