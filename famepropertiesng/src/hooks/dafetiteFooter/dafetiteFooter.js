import { DateHook } from "./dateHook"
import './dafetiteFooter.css'
import dafetite from './dafelogoWhiteTransparent.png'

function DafetiteFooter() {
	const year = DateHook().todayYear;
	return (
		<>
			<span className="span-dafetite">
				<sup>&copy;</sup>Copyright {year} | Developed by
				<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://dafetiteogaga.github.io/dafetite/">
					<img
					src={dafetite}
					alt="dafetite ogaga"
					className="dafetite" />
				</a>
			</span>
		</>
	)
}
// const styles = {
// 	imgStyle: {
// 		width: '50px',
// 		height: '50px',
// 		borderRadius: '50%',
// 		marginLeft: '5px',
// 	}
// }
export { DafetiteFooter };
