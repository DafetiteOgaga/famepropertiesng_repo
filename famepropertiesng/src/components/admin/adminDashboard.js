import { Breadcrumb } from '../sections/breadcrumb';
import { UploadImageItem } from './adminImageKitUpload';

function AdminDashboard() {
	return (
		<>
			{/* Breadcrumb Start */}
			<Breadcrumb page="Admin Page" />

			<div className="container-fluid row px-xl-5"
			style={{
				display: 'flex',
				justifyContent: 'center',
				}}>
				<div>
					<UploadImageItem type={'carousel'} />
					<br /><br />
				</div>
				<div>
					<UploadImageItem type={'products-advert'} />
					<br /><br />
				</div>
				<div>
					<UploadImageItem type={'features-advert'} />
					<br /><br />
				</div>
			</div>
		</>
	)
}
export { AdminDashboard }
