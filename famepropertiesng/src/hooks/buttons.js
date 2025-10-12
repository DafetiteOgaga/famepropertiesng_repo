

function ToggleButton({onClick, checked, onChange, disabled, miniStyle, heights}) {
	// console.log('toggling button')
	// console.log({checked})
	return (
		<>
			<span className={`d-flex align-items-center ${miniStyle}`}>
				<label className="toggle-switch mb-0">
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
export { ToggleButton };
