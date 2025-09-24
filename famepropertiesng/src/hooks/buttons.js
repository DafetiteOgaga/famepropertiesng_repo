

function ToggleButton({onClick, checked, onChange, disabled, miniStyle}) {
	// console.log('toggling button')
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
					/>
					<span className="slider"></span>
				</label>
			</span>
		</>
	)
}
export { ToggleButton };
