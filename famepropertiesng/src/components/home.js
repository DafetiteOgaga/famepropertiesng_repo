import React from "react"
import { Carousel } from "./sections/carousel"
import { Products } from "./products/products"
import { useCheckLoginValidity } from "../hooks/checkLoginValidity"

function Home() {
	useCheckLoginValidity() // check login validity on home page load
	return (
		<>
			<Carousel />
			<Products />
		</>
	)
}
export { Home }
