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
function Sidebar({mobileStyle = null}) {
	return (
		<div
		className='slideInRight'
		style={{
			position: 'sticky',
			top: '5%',
			backgroundColor: mobileStyle?mobileStyle:'',
			padding: mobileStyle?'1.2rem 1rem':'',
			overflowY: 'auto',
			overflowX: 'hidden',
			maxHeight: '80vh',
			borderTopLeftRadius: mobileStyle?'0.8rem':'',
			borderBottomLeftRadius: mobileStyle?'0.8rem':'',
			// backgroundColor: '#000',
			}}>
			{!mobileStyle &&
			<h3 className="text-uppercase pr-1"
			style={{
				color: '#475569',
				}}>Categories</h3>}
			<nav className="navbar navbar-light p-0" id="navbar-vertical">
				<div className="navbar-nav w-100">
					{categoriesOptionsArr.map((option, index) => {
						let optionPath = option.includes('/')?(option.split('/').join('-').toLowerCase()):option.toLowerCase();
						optionPath = optionPath.includes(" ")?(optionPath.split(" ").join('-').toLowerCase()):optionPath;
						return (
							<Link key={index} to={`products/${optionPath}`}
							className="nav-item nav-link slideInRight"
							style={{
								animationDelay: `${index * 0.01}s`,
								color: mobileStyle?'rgb(226, 232, 240)':'',
								textAlign: mobileStyle?'center':'',
								padding: mobileStyle?'0.8rem 0':'',
							}}>{option}</Link>
						)})}
				</div>
			</nav>
		</div>
	)
}
export { Sidebar };
