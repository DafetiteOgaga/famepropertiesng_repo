import { Breadcrumb } from './sections/breadcrumb';
import { titleCase } from '../hooks/changeCase';

function Welcome() {
	// const location = useLocation().pathname.split("/").pop();
	// const [products, setProducts] = useState([]);
	return (
		<>
			{/* Breadcrumb Start */}
			<Breadcrumb page={'Welcome'} />

			<div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
				<h2
				style={{color: '#475569',}}>{titleCase('welcome onboard!')}</h2>
				{/* <h2
				className="text-uppercase"
				style={{color: '#475569',}}>Page Not Found</h2> */}
			</div>
			{/* <div className="container-fluid"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
				<h2
				className="text-uppercase"
				style={{color: '#475569',}}>Page Not Found</h2>
			</div> */}
		</>
	)
}
export { Welcome }
