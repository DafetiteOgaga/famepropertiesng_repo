

function Carousel({getImage}) {
	return (
		<div className="container-fluid mb-3">
			<div className="row px-xl-5">
				<div className="col-lg-8">
					<div id="header-carousel" className="carousel slide carousel-fade mb-30 mb-lg-0" data-ride="carousel">
						<ol className="carousel-indicators">
							<li data-target="#header-carousel" data-slide-to="0" className="active"></li>
							<li data-target="#header-carousel" data-slide-to="1"></li>
							<li data-target="#header-carousel" data-slide-to="2"></li>
						</ol>
						<div className="carousel-inner">
							<div className="carousel-item position-relative active carousel-div1">
								<img className="position-absolute w-100 h-100 carousel-div1-image" alt="" src={getImage("carousel-1.jpg")}/>
								<div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
									<div className="p-3 carousel-div1-inner">
										<h1 className="display-4 text-white mb-3 animate__animated animate__fadeInDown">Men Fashion</h1>
										<p className="mx-md-5 px-5 animate__animated animate__bounceIn">Lorem rebum magna amet lorem magna erat diam stet. Sadips duo stet amet amet ndiam elitr ipsum diam</p>
										<a className="btn btn-outline-light py-2 px-4 mt-3 animate__animated animate__fadeInUp" href="##">Shop Now</a>
									</div>
								</div>
							</div>
							<div className="carousel-item position-relative carousel-div1">
								<img className="position-absolute w-100 h-100 carousel-div1-image" alt="" src={getImage("carousel-2.jpg")}/>
								<div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
									<div className="p-3 carousel-div1-inner">
										<h1 className="display-4 text-white mb-3 animate__animated animate__fadeInDown">Women Fashion</h1>
										<p className="mx-md-5 px-5 animate__animated animate__bounceIn">Lorem rebum magna amet lorem magna erat diam stet. Sadips duo stet amet amet ndiam elitr ipsum diam</p>
										<a className="btn btn-outline-light py-2 px-4 mt-3 animate__animated animate__fadeInUp" href="##">Shop Now</a>
									</div>
								</div>
							</div>
							<div className="carousel-item position-relative carousel-div1">
								<img className="position-absolute w-100 h-100 carousel-div1-image" alt="" src={getImage("carousel-3.jpg")}/>
								<div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
									<div className="p-3 carousel-div1-inner">
										<h1 className="display-4 text-white mb-3 animate__animated animate__fadeInDown">Kids Fashion</h1>
										<p className="mx-md-5 px-5 animate__animated animate__bounceIn">Lorem rebum magna amet lorem magna erat diam stet. Sadips duo stet amet amet ndiam elitr ipsum diam</p>
										<a className="btn btn-outline-light py-2 px-4 mt-3 animate__animated animate__fadeInUp" href="##">Shop Now</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-4">
					<div className="product-offer mb-30 carousel-div2">
						<img className="img-fluid" alt="" src={getImage("offer-1.jpg")}/>
						<div className="offer-text">
							<h6 className="text-white text-uppercase">Save 20%</h6>
							<h3 className="text-white mb-3">Special Offer</h3>
							<a href="##" className="btn btn-primary">Shop Now</a>
						</div>
					</div>
					<div className="product-offer mb-30 carousel-div2">
						<img className="img-fluid" alt="" src={getImage("offer-2.jpg")}/>
						<div className="offer-text">
							<h6 className="text-white text-uppercase">Save 20%</h6>
							<h3 className="text-white mb-3">Special Offer</h3>
							<a href="##" className="btn btn-primary">Shop Now</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
export { Carousel };
