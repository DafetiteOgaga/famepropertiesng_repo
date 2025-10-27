import { useState, useEffect } from 'react';
import './debug.css'

function DebugModeComp() {
	const [debugMode, setDebugMode] = useState(false)
	useEffect(() => {
		if (debugMode) {
			document.body.classList.add('debug-css-outline');
		} else {
			document.body.classList.remove('debug-css-outline');
		}
	}, [debugMode])
	// console.log({debugMode})

	return (
		<>
			<h6
			className="mr-2"
			style={{color: '#475569',}}>Toggle Debug Mode</h6>
			<div className='d-flex align-self-baseline'>
				<DebugToggleButton
				onChange={(e)=>setDebugMode(e.target.checked)}
				checked={debugMode}
				/>
			</div>
		</>
	)
}

function DebugToggleButton({onClick, checked, onChange, disabled, miniStyle, heights}) {
	// console.log({
	// 	onClick,
	// 	checked,
	// 	onChange,
	// 	disabled,
	// 	miniStyle,
	// 	heights
	// })
	return (
		<>
			<span className={`d-flex align-items-center ${miniStyle}`}>
				<label className="toggle-switch mb-2"> {/* mb-0"> */}
					<input
					type="checkbox"
					// checked={allFieldsLocked}
					onClick={onClick}
					checked={checked}
					onChange={onChange}
					disabled={disabled}
					readOnly={!onChange}
					/>
					<span className="slider" style={heights?.height?{
						height: heights.height,
						'--before-height': `${heights.mini}px`,
						}:{}}></span>
				</label>
			</span>
		</>
	)
}
export { DebugModeComp }
