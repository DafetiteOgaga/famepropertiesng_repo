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
	const showFirstPage = prevPage > 1
	const showLastPage = nextPage < total_pages
	// console.log({ prevPage, nextPage, total_pages, load});
	// console.log({loading})

	return (
		<>
			{total_pages>1&&
			<ul className="pagination">
				{/* First */}
				{showFirstPage &&
				<li className={`d-flex page-item`}>
					<button
					className="page-link"
					disabled={loading.action&&loading.mode==='1'}
					style={{
						borderTopLeftRadius: "1rem",
						borderBottomLeftRadius: "1rem",
						borderTopRightRadius: "0.35rem",
						borderBottomRightRadius: "0.35rem",
					}}
					onClick={() => {
						setLoading({
							action: true,
							mode: '1',
						});
						onPageChange(1);
					}}
					>
						{(loading.action&&loading.mode==='1')?
						<span className="d-flex align-items-center">
							<BouncingDots size={"ts"} color={"#475569"} p={"0"} />
						</span>
						:
						'First'}
					</button>
				</li>}

				{/* Previous */}
				<li className={`d-flex page-item ${!prev ? "disabled" : ""}`}>
					<button
					className="page-link"
					disabled={!prev||(loading.action&&loading.mode==='-')}
					style={{
						borderTopLeftRadius: showFirstPage?"0.35rem":"1rem",
						borderBottomLeftRadius: showFirstPage?"0.35rem":"1rem",
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

				{/* Next */}
				<li className={`d-flex page-item ${!next ? "disabled" : ""}`}>
					<button
					className="page-link"
					disabled={!next||(loading.action&&loading.mode==='+')}
					style={{
						borderRadius: "0.35rem",
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

				{/* Last */}
				{showLastPage &&
				<li className={`d-flex page-item`}>
					<button
					className="page-link"
					disabled={loading.action&&loading.mode==='-1'}
					style={{
						borderRadius: "0.35rem",
					}}
					onClick={() => {
						setLoading({
							action: true,
							mode: '-1',
						});
						onPageChange(total_pages);
					}}
					>
						{(loading.action&&loading.mode==='-1')?
						<span className="d-flex align-items-center">
							<BouncingDots size={"ts"} color={"#475569"} p={"0"} />
						</span>
						:
						'Last'}
					</button>
				</li>}

				{/* Current page (derived from prevPage + 1) */}
				<Fragment>
					<li className="page-item active">
						<button className="page-link"
						style={{
							cursor: 'not-allowed',
							pointerEvents: 'none',
							borderTopLeftRadius: "0.35rem",
							borderBottomLeftRadius: "0.35rem",
							borderTopRightRadius: "0.35rem",
							borderBottomRightRadius: "0.35rem",
						}}>
							{prevPage ? prevPage + 1 : 1}
						</button>
					</li>
				</Fragment>

				{/* Total Pages */}
				<li className={`page-item`}>
					<button className="page-lk"
					style={{
						cursor: 'not-allowed',
						pointerEvents: 'none',
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

export { Pagination };
