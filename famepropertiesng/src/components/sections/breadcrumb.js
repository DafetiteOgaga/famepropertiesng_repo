import { Link } from 'react-router-dom';
import { useDeviceType } from '../../hooks/deviceType';

function Breadcrumb({page, slash=true}) {
	const checkPage = page.includes("/")&&slash
	const deviceType = useDeviceType().width <= 576
	// console.log({page, checkPage});
	let otherPages
	let breadcrumb = page
	if (checkPage) {
		const pages = page.split("/")
		breadcrumb = pages.pop()
		otherPages = pages.map((item, index) => {
			// console.log({item, index});
			const itemPath = pages.filter(Boolean).slice(0, index+1).join("/").toLowerCase()
			// console.log("page path:", itemPath);
			return (
				<span key={index}
				className="breadcrumb-item">
					<Link
					to={`/${itemPath}`}
					className="text-dark">
						{item}
					</Link>
				</span>
			)
		})
	}
	return (
		// Breadcrumb Start
		<div className="container-fluid"
		style={{
			paddingLeft: deviceType ? 0 : '',
			paddingRight: deviceType ? 0 : '',
		}}>
			<div className="row px-xl-5">
				<div className="col-12">
					<nav className="breadcrumb bg-light mb-0"
					style={{
						borderRadius: '8px',
						}}>
						<Link to={"/"} className="breadcrumb-item text-dark">Home</Link>
						{otherPages}
						<span className="breadcrumb-item active">{breadcrumb}</span>
					</nav>
				</div>
			</div>
		</div>
	)
}
export { Breadcrumb }
