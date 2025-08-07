import { Carousel } from "./sections/carousel"
import { Products } from "./sections/products"

const images = require.context('../images/img', false, /\.(png|jpe?g|svg)$/);
const getImage = (name) => (images(`./${name}`)) // to get a specific image by name
function Home() {
	return (
		<>
			<Carousel getImage={getImage} />
			<Products getImage={getImage} />
		</>
	)
}
export { Home }
