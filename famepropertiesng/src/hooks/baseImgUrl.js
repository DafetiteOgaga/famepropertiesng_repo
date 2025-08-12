const images = require.context('../images/', true, /\.(png|jpe?g|svg)$/);

function getBaseUrl(image) {
	
	// const finalUrl = `https://raw.githubusercontent.com/DafetiteOgaga/famepropertiesng_assets/refs/heads/main/images/${image}`
	const finalUrl = images(`./${image}`);
	// console.log({finalUrl});
	return finalUrl;
}
const getImage = (fileName, img=null) => getBaseUrl(`${img?img+'/':''}${fileName}`);
export { getImage };
