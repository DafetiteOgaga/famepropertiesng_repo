import React from "react"
import { Carousel } from "./sections/carousel"
import { Products } from "./products/products"
import { BouncingDots } from "../spinners/spinner"

function Home() {
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
