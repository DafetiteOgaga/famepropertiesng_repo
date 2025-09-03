// for fa icons and svgs
// npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core
import './bouncing-dots.css';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCircleNotch, faCog, faSync } from "@fortawesome/free-solid-svg-icons";

function FASync(color="blue", size="2x") {
	return (
		<div className="flex items-center justify-center p-4">
			<FontAwesomeIcon
			icon={faSync}
			color={color}
			spin size={size} />
		</div>
	);
}
function FASpinner(color="blue", size="2x") {
	return (
		<div className="flex items-center justify-center p-4">
			<FontAwesomeIcon
			icon={faSpinner}
			color={color}
			spin size={size} />
		</div>
	);
}
function FACircleNotch(color="blue", size="2x") {
	return (
		<div className="flex items-center justify-center p-4">
			<FontAwesomeIcon
			icon={faCircleNotch}
			color={color}
			spin size={size} />
		</div>
	);
}
function FACog(color="blue", size="2x") {
	return (
		<div className="flex items-center justify-center p-4">
			<FontAwesomeIcon
			icon={faCog}
			color={color}
			spin size={size} />
		</div>
	);
}

function BouncingDots({ size = "md", color = "#3498db", p = 12 }) {
	// console.log({size, color, p})
	// Define some named sizes (like FA)
	const sizeMap = {
		ts: 3,
		vm: 4,
		sm: 6,
		md: 10,
		lg: 14,
		xl: 18,
		"2x": 20,
		"3x": 30,
	};
	// Resolve the actual pixel size
	let dotSize;
	if (typeof size === "number") {
	  dotSize = size; // if you pass <BouncingDots size={25} />
	} else if (size.endsWith("px")) {
	  dotSize = parseInt(size, 10); // if you pass <BouncingDots size="22px" />
	} else {
	  dotSize = sizeMap[size] || sizeMap.md; // fallback to named sizes
	}

	const padSizeMap = {
		"0": "0rem",
		"1": "1rem",
		"2": "2rem",
		"3": "3rem",
		"4": "4rem",
		"5": "5rem",
		"6": "6rem",
		"7": "7rem",
		"8": "8rem",
		"9": "9rem",
		"10": "10rem",
		"11": "11rem",
		"12": "12rem",
		"13": "13rem",
		"14": "14rem",
		"15": "15rem",
		"16": "16rem",
		"17": "17rem",
		"18": "18rem",
		"19": "19rem",
		"20": "20rem",
	};
	// Resolve the actual pixel size
	let padSize;
	if (typeof p === "number") {
		padSize = p; // if you pass <BouncingDots size={25} />
	} else if (size.endsWith("px")) {
		padSize = parseInt(p, 10); // if you pass <BouncingDots size="22px" />
	} else {
		padSize = padSizeMap[p] || padSizeMap["0"]; // fallback to named sizes
	}

	return (
		<div className="dots"
		style={{
			padding: padSize,
		}}>
			{Array.from({ length: 3 }).map((_, index) => (
			<span
				key={index}
				style={{
				width: dotSize,
				height: dotSize,
				backgroundColor: color,
				}}
			/>
			))}
		</div>
	);
}


function TestSpinners() {
	return (
		<div className="container-fluid"
		style={{
			display: 'flex',
			justifyContent: 'center',
			}}>
				<FASync />
				<FASpinner />
				<FACircleNotch />
				<FACog />
				<BouncingDots />
		</div>
	)
}

export {
	FASync,
	FASpinner,
	FACircleNotch,
	FACog,
	BouncingDots,
	TestSpinners
};