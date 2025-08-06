

const productArr = [
	"cat-1.jpg",
	"cat-2.jpg",
	"cat-3.jpg",
	"cat-4.jpg",
	"cat-2.jpg",
	"cat-3.jpg",
	"cat-4.jpg",
	"cat-1.jpg",
	"cat-3.jpg",
	"cat-4.jpg",
	"cat-1.jpg",
	"cat-2.jpg",
]
function Categories({getImage}) {
	return (
		<div className="pt-5">
			<h2 className="section-title position-relative text-uppercase mb-4"><span className="bg-secondary pr-3">Categories</span></h2>
			<div className="row pb-3">
				{productArr.map((product, index) => {
					return (
						<div key={index} className="col-lg-3 col-md-4 col-sm-6 pb-1">
							<a className="text-decoration-none" href="##">
								<div className="cat-item img-zoom d-flex align-items-center mb-4">
									<div className="overflow-hidden categories-div">
										<img className="img-fluid" alt="" src={getImage(product)}/>
									</div>
									<div className="flex-fill pl-3">
										<h6>Category Name</h6>
										<small className="sec-text-body">100 Products</small>
									</div>
								</div>
							</a>
						</div>
					)
				})}
			</div>
		</div>
	)
}
export { Categories };
