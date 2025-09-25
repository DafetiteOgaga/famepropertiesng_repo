import React from "react"
import { Carousel } from "./sections/carousel"
import { Products } from "./products/products"
import { BouncingDots } from "../spinners/spinner"
import { useCheckLoginValidity } from "../hooks/checkLoginValidity"

function Home() {
	useCheckLoginValidity() // check login validity on home page load
	const [loading,] = React.useState(true);
	return (
		<>
			<Carousel />
			<Products />
			{/* {loading && <BouncingDots size="xl" color="#475569" />}  shows dots only if loading */}
		</>
	)
}
export { Home }
