import React from "react";

const maxLikes = 100;

// helper function: convert likes → 0–5 stars
function convertLikesToStars(likes, maxStars = 5) {
	if (likes <= 0) return 0;
	const rating = ((likes / maxLikes) * maxStars).toFixed(2);
	return Math.min(rating, maxStars); // cap at maxStars
}

// StarRating component
function StarRating({ rating }) {
	const starValue = convertLikesToStars(rating);

	const fullStars = Math.floor(starValue);
	const halfStar = starValue % 1 !== 0 ? 1 : 0;
	const emptyStars = 5 - fullStars - halfStar;

	// console.log({starValue, fullStars, halfStar, emptyStars});
	// const stars = [fullStars, halfStar, emptyStars];

	const starsArray = [];

	// full stars
	for (let i = 0; i < fullStars; i++) {
	starsArray.push(
		<small
		key={`full-${i}`}
		className="fa fa-star text-warning"
		></small>
	);
	}

	// half star (only one, if it exists)
	if (halfStar === 1) {
	starsArray.push(
		<small
		key="half"
		className="fa fa-star-half-alt text-warning"
		></small>
	);
	}

	// empty stars
	for (let i = 0; i < emptyStars; i++) {
	starsArray.push(
		<small
		key={`empty-${i}`}
		className="fa fa-star text-secondary"
		></small>
	);
	}

return <div>{starsArray}</div>;
	// stars.map((st, i) => {
	// 	return (
	// 	Array.from({length: st}).map((_, j) => {
	// 		return (
	// 			<small key={`${i}-${j}`} className={`fa fa-star ${(i===1?'-half-alt':'')} ${i===0?'text-warning':'text-secondary'} mr-1`}></small>
	// 		)
	// 	}))
	// })
	// return (
	// 	<>
	// 		{/* <div className="flex items-center gap-1 text-yellow-500 text-xl"> */}
	// 		<small className={`fa fa-star ${(halfStar?'-half-alt':'')} ${fullStars?'text-warning':'text-secondary'} mr-1`}></small>




		
	// 		{/* </div> */}
	// 	</>
	// );
}
export { StarRating, convertLikesToStars };

// {/* Full stars */}
// // {Array(fullStars)
// // 	.fill()
// // 	.map((_, i) => (
// // 	<span key={`full-${i}`}>★</span>
// // 	))}

// {/* Half star */}
// // {halfStar === 1 && <span key="half">⯪</span>}

// {/* Empty stars */}
// // {Array(emptyStars)
// // 	.fill()
// // 	.map((_, i) => (
// // 	<span key={`empty-${i}`}>☆</span>
// // 	))}
