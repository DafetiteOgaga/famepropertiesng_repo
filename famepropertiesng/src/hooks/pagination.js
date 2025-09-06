import { useState, useEffect, useRef, Fragment } from "react";
import { BouncingDots } from "../spinners/spinner";

function Pagination({ pagination, onPageChange }) {
	const { count, next, prev, total_pages, load
		// page_range, start_index, end_index
	} = pagination;
	const loadRef = useRef(null);
	const [loading, setLoading] = useState({
										action: false,
										mode: null,
									});
	useEffect(() => {
		// console.log(
		// 	'\nloadRef:', loadRef.current,
		// 	'\nload:', load,
		// 	'\nloading:', loading
		// )
		if (loading && loadRef.current!==load) {
			// console.log('Load changed, stop loading spinner');
			setLoading({
				action: false,
				mode: null,
			});
			loadRef.current = load;
		}
	}, [load])

	// Extract current page from next/prev URLs
	const getPageNumber = (url, mode) => {
		if (!url) return mode==='-'?0:'x';
		const params = new URL(url).searchParams;
		// console.log(params.get("page")??0);
		return parseInt(params.get("page")??1);
	};

	const nextPage = getPageNumber(next, '+');
	const prevPage = getPageNumber(prev, '-');
	// console.log({ prevPage, nextPage, total_pages, load
	// 	// page_range, start_index, end_index
	// });
	// console.log({loading})

	return (
		<>
			{total_pages>1&&
			<ul className="pagination">
				{/* Previous */}
				<li className={`d-flex page-item ${!prev ? "disabled" : ""}`}>
					<button
					className="page-link"
					disabled={!prev||(loading.action&&loading.mode==='-')}
					style={{
						borderTopLeftRadius: "1rem",
						borderBottomLeftRadius: "1rem",
						borderTopRightRadius: "0.35rem",
						borderBottomRightRadius: "0.35rem",
					}}
					onClick={() => {
						setLoading({
							action: true,
							mode: '-',
						});
						prevPage && onPageChange(prevPage);
					}}
					>
						{(loading.action&&loading.mode==='-')?
						<span className="d-flex align-items-center">
							<BouncingDots size={"ts"} color={"#475569"} p={"0"} />
						</span>
						:
						'Prev'}
					</button>
				</li>

				{/* Current page (derived from prevPage + 1) */}
				<Fragment>
					<li className="page-item active">
						<button className="page-link"
						style={{
							borderTopLeftRadius: "0.35rem",
							borderBottomLeftRadius: "0.35rem",
							borderTopRightRadius: "0.35rem",
							borderBottomRightRadius: "0.35rem",
						}}>
							{/* {console.log('prevPage', prevPage)} */}
							{prevPage ? prevPage + 1 : 1}
						</button>
					</li>
				</Fragment>

				{/* Next */}
				<li className={`d-flex page-item ${!next ? "disabled" : ""}`}>
					<button
					className="page-link"
					disabled={!next||(loading.action&&loading.mode==='+')}
					style={{
						borderTopLeftRadius: "0.35rem",
						borderBottomLeftRadius: "0.35rem",
						borderTopRightRadius: "0.35rem",
						borderBottomRightRadius: "0.35rem",
					}}
					onClick={() => {
						setLoading({
							action: true,
							mode: '+',
						});
						nextPage && onPageChange(nextPage);
					}}
					>
						{(loading.action&&loading.mode==='+')?
						<span className="d-flex align-items-center">
							<BouncingDots size={"ts"} color={"#475569"} p={"0"} />
						</span>
						:
						'Next'}
					</button>
				</li>

				<li className={`page-item`}>
					<button className="page-lk"
					style={{
						// cursor: next ? "pointer" : "not-allowed",
						borderTopRightRadius: "1rem",
						borderBottomRightRadius: "1rem",
						borderTopLeftRadius: "0.35rem",
						borderBottomLeftRadius: "0.35rem",
						fontStyle: 'italic',
					}}>
						of {total_pages}
					</button>
				</li>

			</ul>}
		</>
	);
}

export default Pagination;
