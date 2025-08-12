import { DafetiteFooter } from "../../hooks/dafetiteFooter/dafetiteFooter";
// import famousPropertiesNGLogo from '../../images/famouspropertiesngTransparent.png';
import { Link } from 'react-router-dom';
import { useDeviceType } from "../../hooks/deviceType";
import { Fragment } from "react";
import { getImage } from "../../hooks/baseImgUrl";

const switchFooter = [
	<FooterBrand />,
	<MailingList />
]
function Footer() {
	const deviceType = useDeviceType();
	const footerItems = deviceType.width > 768 ? switchFooter : [...switchFooter].reverse();

	return (
		<div className="bg-dark text-secondary mt-5 pt-3">
			<div className="row px-xl-5"
			style={{margin: 0}}>
				{footerItems.map((comp, index) => {
					return (
						<Fragment key={index}>
							{comp}
						</Fragment>
					)
				})}
				
			</div>
			<div className="row border-top mx-xl-5 py-2 footer-div"
			style={{margin: 0}}>
				<div className="col-md-6 px-xl-0">
					<p className="mb-md-0 text-center text-md-left text-secondary">
						<DafetiteFooter />
					</p>
				</div>
				{/* <div className="col-md-6 px-xl-0 text-center text-md-right">
					<img className="img-fluid" alt="" src={getImage("payments.png")}/>
				</div> */}
			</div>
		</div>
	)
}

function FooterBrand() {
	return (
		<div className="col-lg-6 col-md-12 mb-2 pr-3 pr-xl-5">
			<Link to={"/"}
			className="text-decoration-none pb-3"
			style={{
				display: 'flex',
				cursor: 'pointer',
				}}>
				<img src={getImage('famouspropertiesngTransparent.png')} alt="famouspropertiesng"
				style={{width: '5%', backgroundColor: '#f5f5f5', borderRadius: '5%'}} />
				<div
				style={{alignSelf: 'center'}}>
					<span className="text-uppercase text-primary bg-dark px-2 bold-text">famousproperties</span>
					<span className="text-uppercase text-dark bg-primary px-2 bold-text ml-n1">NG</span>
				</div>
			</Link>
			<p className="mb-2"><i className="fa fa-map-marker-alt text-primary mr-3"></i>123 Street, Lagos, Nigeria</p>
			<p className="mb-2"><i className="fa fa-envelope text-primary mr-3"></i>info@example.com</p>
			<p className="mb-0"><i className="fa fa-phone-alt text-primary mr-3"></i>+012 345 67890</p>
		</div>
	)
}

function MailingList() {
	return (
		<div className="col-lg-6 col-md-12">
			<div className="row">
				<div className="col-md-12 mb-2">
					<h5 className="text-secondary text-uppercase mb-0">Subscribe to our mailing list</h5>
					<p>Don't miss out! Be one of the first 50 to get notified when new products arrive.</p>
					<form action="">
						<div className="input-group">
							<input type="text" className="form-control" placeholder="Your Email Address"/>
							<div className="input-group-append">
								<button className="footerbtn btn btn-primary">Sign Up</button>
							</div>
						</div>
					</form>
					<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
						<h6 className="text-secondary text-uppercase mt-4 mb-3 pr-3">Follow Us</h6>
						<div className="d-flex">
							<Link to={''} className="btn btn-primary btn-square mr-2"><span className="fab fa-twitter"></span></Link>
							<Link to={''} className="btn btn-primary btn-square mr-2"><span className="fab fa-facebook-f"></span></Link>
							<Link to={''} className="btn btn-primary btn-square mr-2"><span className="fab fa-linkedin-in"></span></Link>
							<Link to={''} className="btn btn-primary btn-square"><span className="fab fa-instagram"></span></Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
export { Footer };
