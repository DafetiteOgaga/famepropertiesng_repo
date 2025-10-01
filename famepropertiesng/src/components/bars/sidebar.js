import { useEffect, useState } from 'react';
import { getBaseURL } from '../../hooks/fetchAPIs';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateStorage } from '../../hooks/setupLocalStorage';
import { BouncingDots } from '../../spinners/spinner';
import { titleCase } from '../../hooks/changeCase';

const baseURL = getBaseURL();

function Sidebar({mobileStyle = null, categoryMenuRef = null}) {
	const [categoriesOptions, setCategoriesOptions] = useState(null);
	const [isSubMenu1Open, setIsSubMenu1Open] = useState([]);
	const { createLocal, createSession } = useCreateStorage()
	const fetchCategories = async (endpoint="categories") => {
		try {
			const categoriesRes = await (fetch(`${baseURL}/${endpoint}/`));
			if (!categoriesRes.ok) {
				throw new Error("Network response was not ok");
			}
			const categoriesData = await categoriesRes.json();
			setCategoriesOptions(categoriesData);
			createSession.setItem('fpng-catg', categoriesData);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}
	useEffect(() => {
		if (categoriesOptions?.length) {
			setIsSubMenu1Open(Array.from({length: categoriesOptions.length}).map(() => false));
		}
	}, [categoriesOptions])
	useEffect(() => {
		const localCategories = createSession.getItem('fpng-catg');
		if (localCategories?.length) {
			// console.log('Using local categories:', localCategories)
			setCategoriesOptions(localCategories);
		} else {
			console.log('Fetching categories')
			fetchCategories();
		}
	}, [])
	// console.log({categoriesOptions})
	// console.log('Sidebar Rendered')
	// console.log({isSubMenu1Open})
	return (
		<div
		ref={categoryMenuRef}
		className={`${mobileStyle?'slideInRight':'pt-3 bg-light p-4'}`}
		style={{
			...{
			position: 'sticky',
			top: '5%',
			backgroundColor: mobileStyle?mobileStyle:'',
			padding: mobileStyle?'1.2rem 1rem':'',
			overflowY: 'auto',
			overflowX: 'hidden',
			maxHeight: mobileStyle?'75vh':'',
			borderTopLeftRadius: '0.8rem',
			borderBottomLeftRadius: '0.8rem',
			borderTopRightRadius: mobileStyle?'':'0.8rem',
			borderBottomRightRadius: mobileStyle?'':'0.8rem',
			// backgroundColor: '#000',
			},
			...mobileStyle?
			{}
			:
			{
				// border: '1px solid #475569',
				width: 250,
				}}}>
			{!mobileStyle &&
			// <h3 className="text-uppercase pr-1"
			// style={{
			// 	color: '#475569',
			// 	}}>Categories</h3>
			<h5 className={`${mobileStyle?'pr-1':'position-relative mb-0'} text-uppercase`}
			style={{
				color: '#475569',
				// textDecoration: 'underline',
				textDecorationColor: '#475569',
				textDecorationThickness: '1px',
				}}>Categories
				{/* <span
				style={{fontWeight: 'lighter'}}>-----</span> */}
				</h5>
				}
			<nav className={`navbar navbar-light p-0`} id="navbar-vertical"
			// style={{borderRadius: mobileStyle?'':'0.8rem',}}
			>
				<div className="navbar-nav w-100">
					{categoriesOptions ?
						categoriesOptions.map((category, index) => {
							return (
								<CategoryItem
								key={category?.id+category?.name}
								category={category}
								mobileStyle={mobileStyle}
								level={0}
								/>
							)
						})
						:
						<BouncingDots size={"ts"} color={mobileStyle?"#fff":"#475569"} p={"5"} />}
				</div>
			</nav>
		</div>
	)
}

function CategoryItem({ category, mobileStyle, level = 0 }) {
	const navigate = useNavigate()
	const [isOpen, setIsOpen] = useState(false);
	const hasChildren = (category?.subcategories?.length ?? 0) > 0;
	const categoryName = category?.name
	// ?.split()?.map(cname => {
	// 	let nname = cname;
	// 	// console.log({nname})
	// 	if (nname.includes(' ')||nname.includes('&')) {
	// 		nname = nname.split(' ').join('-');
	// 		nname = nname.split('-&-').join('-');
	// 	}
	// 	return nname.toLowerCase();
	// })?.join('-')
	// console.log({categoryName})
	const navigateTo = `products/${categoryName}`
	// const navigateTo = `products/${category.name}`

	return (
		<div style={{ marginLeft: `${level * 8}px` }}>

			{/* header - clickable only */}
			<div
				className={`nav-item nav-link ${mobileStyle ? "slideInRight" : ""}`}
				role={hasChildren ? "button" : undefined}
				onClick={(e) => {
					// toggle only this item's open state
					if (!hasChildren) {
						navigate(navigateTo)
					};
					e.stopPropagation();            // prevent bubbling to ancestors
					setIsOpen((prev) => !prev);
				}}
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					cursor: hasChildren ? "pointer" : "default",
					padding: mobileStyle ? "0.8rem 0" : "0.2rem 1rem",
					color: mobileStyle ? "rgb(226,232,240)" : "#475569",
				}}>

				{/* when no children, render a Link so clicking navigates */}
				{hasChildren ?
					(<span>{titleCase(category.name)}</span>)
					:
					(
						<Link
						to={navigateTo}
						onClick={(e) => e.stopPropagation()} // don't bubble to parents
						style={{
							color: "inherit",
							textDecoration: "none",
							textWrap: "nowrap"
						}}
						>
						{titleCase(category.name)}
						</Link>
					)}

				{hasChildren &&
					(<span className={`fas fa-angle-${isOpen ? "down" : "right"}`} />)}
			</div>

			{/* children container (no onClick here) */}
			{hasChildren && isOpen && (
				<div>
					{category.subcategories.map((sub) => (
						<CategoryItem
							key={sub.id ?? sub.name}
							category={sub}
							mobileStyle={mobileStyle}
							level={level + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export { Sidebar };
