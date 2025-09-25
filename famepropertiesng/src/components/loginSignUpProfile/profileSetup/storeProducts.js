import { useState, useEffect } from "react";
import { Breadcrumb } from "../../sections/breadcrumb";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeviceType } from "../../../hooks/deviceType";
import { useCreateStorage } from "../../../hooks/setupLocalStorage";
import { BouncingDots } from "../../../spinners/spinner";
import { digitSeparator, titleCase } from "../../../hooks/changeCase";
import { useOutletContext } from 'react-router-dom';
import { toast } from "react-toastify";
import { getBaseURL } from "../../../hooks/fetchAPIs";
import { Pagination } from "../../../hooks/pagination";

const tableHeadArr = [
	"Products",
	"Name",
	"Discount Price",
	"Market Price",
	"Quantity Remaining",
]

const baseURL = getBaseURL();

function StoreProducts() {
	const parameters = useParams()
	const navigate = useNavigate();
	const { createLocal } = useCreateStorage()
	const deviceType = useDeviceType().width <= 576;
	const [loadingImages, setLoadingImages] = useState({});
	const userInfo = createLocal.getItem('fpng-user');
	const lStore = createLocal.getItem('fpng-stor')||[];
	const [loading, setLoading] = useState(false)
	const [load, setLoad] = useState(0);
	const [storeProductsArr, setStoreProductsArr] = useState(null)
	const [pagination, setPagination] = useState({
		prev: null,
		next: null,
		count: null,
		total_pages: null,
	});
	const lStoreDetails = lStore.find(store=>store.id?.toString()===parameters?.storeID?.toString())

	const fetchStoreProducts = async (endpoint=`store-products/${parameters?.storeID}/`) => {
		try {
			const response = await fetch(`${baseURL}/${endpoint}`);
	
			if (!response.ok) {
				const errorData = await response.json();
				console.warn('Error:', errorData);
				toast.error(errorData?.error);
				setLoading(false);
				return;
			}
			const data = await response.json();
			console.log('Response data from server',data)
			setPagination({
				prev: data?.previous,
				next: data?.next,
				count: data?.count,
				total_pages: data?.total_pages,
				load: load,
			});
			setLoad(prev=>prev+1);
			setStoreProductsArr(data?.results||[]);
			return data;
		} catch (error) {
			console.error("Error during update:", error);
			toast.error('Error! Update Failed. Please try again.');
			return null;
		} finally {
			setLoading(false);
			// console.log('setting loading to false...')
		}
	}

	useEffect(() => {
		// console.log({parameters: parameters.storeID})
		if (parameters?.storeID) {
			fetchStoreProducts()
		}
	}, [])

	const handlePagination = (page) => {
		console.log('Pagination to:', page);
		if (!page) return;
		console.log({page})
		fetchStoreProducts(`store-products/${parameters?.storeID}/?page=${page}`);
	}

	// handles image loading state
	const handleImageLoad = (id) => {
		setLoadingImages(prev => ({ ...prev, [id]: false }));
	};

	const handleImageStart = (id) => {
		setLoadingImages(prev => ({ ...prev, [id]: true }));
	};

	const currencySym = userInfo?.currencySymbol||'₦'
	const isProductAvailable = storeProductsArr?.length

	// console.log({inputValue});
	// console.log({userInfo})
	// console.log({totalAmount})
	// console.log({parameters: parameters.storeID})
	// console.log({storeProductsArr})
	// console.log({lStore})
	// console.log({lStoreDetails})
	return (
		<>
			<Breadcrumb page={titleCase(lStoreDetails?.store_name)} />

			{!loading ?
			<div className="container-fluid mt-3"style={{
				paddingLeft: deviceType ? 0 : '',
				paddingRight: deviceType ? 0 : '',
			}}>
				{/* <h2 className="section-title position-relative text-uppercase mx-xl-5 mb-4"><span className="bg-secondary pr-3"
				style={{color: '#475569'}}>store name here</span></h2> */}
				<div className="row px-xl-5 justify-content-center">
					<div className="col-lg-8 table-responsive mb-5">
						<table className={`table ${isProductAvailable?'table-light':''} table-borderless table-hover text-center mb-0`}>
							<thead className="thead-dark">
								<tr>
									{tableHeadArr.map((head, index) => {
										const first = index === 0;
										const last = index === tableHeadArr.length - 1;
										const headKey = head.toLowerCase()
										return (
											<th key={index} className="align-middle"
											style={{
												...first?{borderTopLeftRadius: 8,}:
												last&&{borderTopRightRadius: 8,},
												...deviceType?(
													styles.mobilePadding,
													styles.mobileFontSize):
													{
														width: headKey==='products'?'5%':
																headKey==='name'?'20%':
																headKey==='price'?'5%':
																headKey==='quantity'?'25%':
																headKey==='x'?'10%':'',}}}>
													{head}
											</th>
										)
									})}
								</tr>
							</thead>
							{isProductAvailable?
							<tbody className="align-middle opacy">
								{storeProductsArr.map((product, index) => {
									const isLoading = loadingImages[product?.id]
									const available = !!product?.numberOfItems
									console.log({product, available})
									return (
										<tr key={index}
										onClick={()=>navigate(`/detail/${product?.id}`)}
										style={{
											cursor: available?'pointer':'not-allowed',
											pointerEvents: available?'auto':'none',
											backgroundColor: available?'':'#99919126',
										}}>

											{/* image */}
											<td className="align-middle"
											style={{
												...deviceType?styles.mobilePadding:{},
												}}>
												{isLoading && (
													<BouncingDots size="ts" color="#475569" p="1" />)}
													<img
													key={product?.id}
													src={product?.thumbnail_url_0||product?.image_url_0}
													alt={product?.name}
													className={`cart-image-img ${isLoading ? 'd-none' : ''}`}
													onLoad={() => handleImageLoad(product?.id)}
													onError={() => handleImageLoad(product?.id)} // stop loader on error too
													onLoadStart={() => handleImageStart(product?.id)}
												/>
											</td>

											{/* product name */}
											<td className="align-middle text-wrap" // text-left"
											style={{
												...deviceType?styles.mobilePadding:{},
												}}>{titleCase(product?.name||'')}</td>

											{/* discount price */}
											<td className="align-middle text-bg-color text-nowrap"
											style={deviceType?styles.mobilePadding:{}}>
												{currencySym} {digitSeparator(product?.discountPrice?.split('.')[0])}
											</td>

											{/* market price */}
											<td className="align-middle text-bg-color text-nowrap"
											style={{
												...deviceType?
												styles.mobilePadding:{},
												fontSize: 14,
												}}>
												<del>{currencySym} {digitSeparator(product?.marketPrice?.split('.')[0])}</del>
											</td>

											{/* number of products left */}
											<td className="align-middle text-nowrap"
											style={{
												...deviceType?styles.mobilePadding:{},
												color: available?'#475569':'grey',}}>
												{available?product?.numberOfItems:'Sold Out'}
											</td>
										</tr>
									)
								})}
							</tbody>
							:
							<tbody>
								<tr>
									<td colSpan="5" className="text-center font-italic">
										You have no products in this store yet.
									</td>
								</tr>
							</tbody>}
						</table>
					</div>
				</div>
				<div className="col-12">
					<nav>
						<ul className="pagination justify-content-center">
							<Pagination pagination={pagination} onPageChange={handlePagination} />
						</ul>
					</nav>
				</div>
			</div>
			:
			<BouncingDots size={deviceType?"sm":"lg"} color="#475569" p={deviceType?"10":"14"} />}
		</>
	)
}

const styles = {
	mobilePadding: {
		padding: '0.8rem 0.2rem'
	},
	mobileFontSize: {
		fontSize: '14px',
		padding: '10px 4px', // increase tap area
	},
	mobileQtyWidth: {
		display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
	},
	pCQtyWidth: {
		width: '50%',
	}
}
export { StoreProducts };
