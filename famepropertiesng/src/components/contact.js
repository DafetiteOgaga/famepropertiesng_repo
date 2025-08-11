import { useLocation, Link } from 'react-router-dom';
import { Breadcrumb } from './sections/breadcrumb';
import { useDeviceType } from '../hooks/deviceType';

function Contact() {
	const location = useLocation().pathname.split("/").pop();
	const deviceType = useDeviceType().width <= 576;
	// console.log("Current Location:", location);
	return (
		<>
			<Breadcrumb page={'Contact'} />

			{/* <!-- Contact Start --> */}
			<div className="container-fluid"style={{
				paddingLeft: deviceType ? 0 : '',
				paddingRight: deviceType ? 0 : '',
			}}>
				<h2 className="section-title position-relative text-uppercase mx-xl-5 mb-4"><span className="bg-secondary pr-3"
				style={{color: '#475569'}}>Contact Us</span></h2>
				<div className="row px-xl-5">
					<div className="col-lg-7 mb-5">
						<div className="contact-form bg-light p-30"
						style={{borderRadius: '10px'}}>
							<div id="success"></div>
							<form name="sentMessage" id="contactForm" noValidate="novalidate">
								<div className="control-group">
									<input type="text" className="form-control" id="name" placeholder="Your Name"
										required="required" data-validation-required-message="Please enter your name" />
									<p className="help-block text-danger"></p>
								</div>
								<div className="control-group">
									<input type="email" className="form-control" id="email" placeholder="Your Email"
										required="required" data-validation-required-message="Please enter your email" />
									<p className="help-block text-danger"></p>
								</div>
								<div className="control-group">
									<input type="text" className="form-control" id="subject" placeholder="Subject"
										required="required" data-validation-required-message="Please enter a subject" />
									<p className="help-block text-danger"></p>
								</div>
								<div className="control-group">
									<textarea className="form-control" rows="8" id="message" placeholder="Message"
										required="required"
										data-validation-required-message="Please enter your message"></textarea>
									<p className="help-block text-danger"></p>
								</div>
								<div>
									<button className="btn btn-primary py-2 px-4" type="submit" id="sendMessageButton">Send
										Message</button>
								</div>
							</form>
						</div>
					</div>
					<div className="col-lg-5 mb-5">
						<div className="bg-light mb-30"
						style={{
							borderRadius: '8px',
							padding: 5
							}}>
							<iframe
							className="contact-iframe-frame"
							title="Google Map"
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.775954257609!2d3.236202274623938!3d6.549947222856214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b85035bd522d1%3A0x511bd0254602b720!2sIsheri%20Rd%2C%20Lagos!5e0!3m2!1sen!2sng!4v1754568154818!5m2!1sen!2sng"
							width="600"
							height="450"
							style={{border: 0,}}
							allowFullScreen=""
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade">
							</iframe>
						</div>
						<div className="bg-light p-30 mb-3"
						style={{borderRadius: '8px'}}>
							<p className="mb-2"><i className="fa fa-map-marker-alt text-black-50 mr-3"></i>123 Street, Lagos, Nigeria</p>
							<p className="mb-2"><i className="fa fa-envelope text-black-50 mr-3"></i>info@example.com</p>
							<p className="mb-2"><i className="fa fa-phone-alt text-black-50 mr-3"></i>+012 345 67890</p>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
export { Contact }
