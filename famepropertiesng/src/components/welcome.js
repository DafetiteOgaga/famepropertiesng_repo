import { Breadcrumb } from './sections/breadcrumb';
import { titleCase } from '../hooks/changeCase';

function Welcome() {
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
			</div>
		</>
	)
}
export { Welcome }
