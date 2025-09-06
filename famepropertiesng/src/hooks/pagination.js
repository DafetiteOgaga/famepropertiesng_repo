import { Fragment } from "react";

function Pagination({ pagination, onPageChange }) {
	const { count, next, prev, total_pages,
		// page_range, start_index, end_index
	} = pagination;

	// Extract current page from next/prev URLs
	const getPageNumber = (url, mode) => {
		if (!url) return mode==='-'?0:'x';
		const params = new URL(url).searchParams;
		// console.log(params.get("page")??0);
		return parseInt(params.get("page")??1);
	};

	const nextPage = getPageNumber(next, '+');
	const prevPage = getPageNumber(prev, '-');
	// console.log({ prevPage, nextPage, total_pages,
	// 	// page_range, start_index, end_index
	// });

	return (
		<>
			{total_pages>1&&
			<ul className="pagination">
				{/* Previous */}
				<li className={`page-item ${!prev ? "disabled" : ""}`}>
					<button
					className="page-link"
					disabled={!prev}
					style={{
						borderTopLeftRadius: "1rem",
						borderBottomLeftRadius: "1rem",
						borderTopRightRadius: "0.35rem",
						borderBottomRightRadius: "0.35rem",
					}}
					onClick={() => prevPage && onPageChange(prevPage)}
					>
						Prev
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
				<li className={`page-item ${!next ? "disabled" : ""}`}>
					<button
					className="page-link"
					disabled={!next}
					style={{
						borderTopLeftRadius: "0.35rem",
						borderBottomLeftRadius: "0.35rem",
						borderTopRightRadius: "0.35rem",
						borderBottomRightRadius: "0.35rem",
					}}
					onClick={() => nextPage && onPageChange(nextPage)}
					>
						Next
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
						Of {total_pages}
					</button>
				</li>

			</ul>}
		</>
	);
}

export default Pagination;
