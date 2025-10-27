import { Listbox } from "@headlessui/react";
import { titleCase } from "./changeCase";

function ToggleButton({onClick, checked, onChange, disabled, miniStyle, heights}) {
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

function HeadlessSelectBtn({onChangeLB, lbStateVal, lbArr, lbInitialVal, input=null}) {
	const txtLength = 29
	// console.log({lbStateVal, lbInitialVal, lbArr, input});
	return (
		<>
			<div style={{
				position: "relative",
				width: "100%",
				cursor: "pointer",
				}}>
				<div className='d-flex flex-row'
				style={{
					border: '1px solid #ccc',
					borderRadius: '5px',
					padding: '9px',
					}}>
					{/* listbox container */}
					<Listbox value={lbStateVal}
					onChange={(value) => {
						console.log({
							cdlen: onChangeLB?.length,
							value
						});
						onChangeLB?.forEach((fn, idx) => {
							if (idx === 0) fn?.(value); // first callback gets the selected value
							else fn?.(""); // all others get reset
						});
					}}
					disabled={input?.disabled || false}>

						{input &&
						// Hidden input for form submission
						<input
						type="hidden"
						name={input.name}
						required
						value={input.value}
						/>}

						{/* listbox select element */}
						<Listbox.Button
						style={lbStyles.listBoxInputBtn}>
							{titleCase(lbInitialVal.length>txtLength ?
								lbInitialVal.slice(0,(txtLength-3))+'...':
								lbInitialVal)}
							{/* arrow element */}
							<span
							className='fa fa-angle-down'
							style={{
								// marginLeft: '2%',
								fontSize: 18,
							}}/>
						</Listbox.Button>
						{/* listbox menu options container */}
						<Listbox.Options
						style={lbStyles.listBoxDropdownOptions}>
							{/* listbox menu option items */}
							{lbArr?.map((s) => {
								// const isStore = input?.name === 'storeID'
								// console.log({s})
								let dropDownVal = s?.name || s?.store_name || s?.id || s.checkoutID || s
								dropDownVal = dropDownVal.length>txtLength ?
												dropDownVal.slice(0,(txtLength-1))+'...' :
												dropDownVal
								// console.log('===', {dropDownVal, len: dropDownVal.length})
								return (
									<Listbox.Option
									key={(s?.name+s?.code)||(s?.store_name)||(s?.id)||s.checkoutID||s}
									value={s?.code||s?.id||s?.id||s.checkoutID||s}>
										{/* automatic active and selected props for styling */}
										{({ active, selected }) => (
											<div
												style={{
												...lbStyles.dropdownItem,
												backgroundColor: active ? "#f0f0f0" : "white",
												fontWeight: selected ? "600" : "normal",
												transition: "background-color 0.2s ease",
												}}
											>
												{titleCase(dropDownVal)}
											</div>
											)}
									</Listbox.Option>
							)})}
						</Listbox.Options>
					</Listbox>
				</div>
			</div>
		</>
	)
}

export {
	ToggleButton,
	HeadlessSelectBtn
};

const lbStyles = {
	listBoxInputBtn: {
		width: "100%",
		padding: "5px",
		borderRadius: "6px",
		border: "1px solid #ccc",
		backgroundColor: "#fff",
		textAlign: "left",
		cursor: "pointer",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		margin: -4,
		display: "inline-flex",
		justifyContent: "space-between",
		color: "#757575",
		// fontSize: 16,
	},
	listBoxDropdownOptions: {
		position: "absolute",
		// marginTop: "7.5%",
		top: "100%",
		left: 0,
		width: "100%",
		backgroundColor: "#fff",
		border: "1px solid #ddd",
		borderRadius: "6px",
		boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
		maxHeight: "200px",
		overflowY: "auto",
		overflowX: "hidden",
		zIndex: 10,
	},
	dropdownItem: {
		padding: "10px 12px",
		cursor: "pointer",
	}
}
