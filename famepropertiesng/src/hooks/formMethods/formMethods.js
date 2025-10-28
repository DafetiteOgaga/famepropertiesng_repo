import React, { useState, useEffect, useRef } from 'react';
import { getNigeriaStates, getLGAs, getLgaSubAreas } from "geo-ng";
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import 'react-country-state-city/dist/react-country-state-city.css';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBaseURL } from '../fetchAPIs';
import { useAuthFetch } from '../../components/loginSignUpProfile/authFetch';
import { useCreateStorage } from '../setupLocalStorage';
import { titleCase } from '../changeCase';
import { HeadlessSelectBtn } from '../buttons';

// const baseURL = getBaseURL();

function useNigeriaLocationPicker(onLocationChange, country, onPickerReady) {
	// const { onLocationChange } = props;
	// State variables to track selected state, LGA, and area
	const [selectedNGState, setSelectedNGState] = useState("");
	const [selectedNGLGA, setSelectedNGLGA] = useState("");
	const [selectedNGArea, setSelectedNGArea] = useState("");
	// const [areas, setAreas] = useState([]);
	const profilePage = useLocation().pathname.split('/')[1].toLowerCase()==='profile'; // to differentiate between profile and signup forms
	// console.log({profilePage})

	// Load all Nigerian states
	const states = getNigeriaStates();

	// Load LGAs dynamically when a state is selected
	const lgas = selectedNGState ? getLGAs(selectedNGState) : [];

	// // Load areas dynamically when an LGA is selected
	// useEffect(() => {
	// 	console.log('='.repeat(60))
	// 	console.log('Loading areas for:', {selectedNGState, selectedNGLGA})
	// 	if (selectedNGState && selectedNGLGA) {
	// 		console.log('Setting areas for:', {selectedNGState, selectedNGLGA})
	// 		const areasList = getLgaSubAreas(selectedNGState, selectedNGLGA);
	// 		console.log('w'.repeat(60))
	// 		console.log({areasList})
	// 		setAreas(areasList);
	// 	} else {
	// 		console.log('Clearing areas')
	// 		setAreas([]);
	// 	}
	// }, [selectedNGState, selectedNGLGA]); // runs on mount + change

	// Load areas dynamically when an LGA is selected
	const areas =
		selectedNGState && selectedNGLGA
		? getLgaSubAreas(selectedNGState, selectedNGLGA)
		: [];

	// bubble up setters to the parent
	useEffect(() => {
		if (onPickerReady) {
			onPickerReady({
				setSelectedNGState,
				setSelectedNGLGA,
				setSelectedNGArea,
				selectedNGState,
				selectedNGLGA,
				selectedNGArea,
			});
		}
	}, []);

	// notify parent of changes:
	useEffect(() => {
		let stateName = null;
		let stateCode = null;

		if (selectedNGState) {
			const stateObj = states.find((s) => s.code === selectedNGState);
			stateName = stateObj?.name;
			stateCode = stateObj?.code;
		}

		if (onLocationChange) {
			onLocationChange({
				state: stateName || null,
				stateCode: stateCode || null,
				lga: selectedNGLGA || null,
				area: selectedNGArea || null,
			});
		}
	}, [selectedNGState, selectedNGLGA, selectedNGArea]);

	useEffect(() => {
		// reset if country is not Nigeria
		if (country?.name?.toLowerCase() !== "nigeria") {
			setSelectedNGState("");
			setSelectedNGLGA("");
			setSelectedNGArea("");
		}
	}, [country?.name])

	// console.log('w'.repeat(60))
	// console.log({selectedNGState, selectedNGLGA, selectedNGArea})
	// console.log({country})
	// console.log({states, lgas, areas})
	// console.log('x'.repeat(60))
	return {
		NGStateCompSelect: (
			<>
				<HeadlessSelectBtn
					onChangeLB={[setSelectedNGState,
							setSelectedNGLGA,
							setSelectedNGArea]}
					lbStateVal={selectedNGState}
					lbArr={states}
					lbInitialVal={(states.find(state=>
								state.code===selectedNGState)?.name)||
								"Select State"}/>
			</>),

		NGLGACompSelect: (
			(
				<>
					<HeadlessSelectBtn
					onChangeLB={[setSelectedNGLGA,
							setSelectedNGArea,]}
					lbStateVal={selectedNGLGA}
					lbArr={lgas}
					lbInitialVal={(selectedNGLGA) || "Select LGA"}/>
				</>
			)),

		NGAreaCompSelect:
			(selectedNGLGA && (
				<>
					<HeadlessSelectBtn
					onChangeLB={[setSelectedNGArea,]}
					lbStateVal={selectedNGArea}
					lbArr={areas}
					lbInitialVal={(selectedNGArea) || "Select Area"}/>
				</>
			))
	};
}

const useCountryStateCity = () => {
	const [cscRequiredFieldsGood, setCscRequiredFieldsGood] = useState(false);
	const profilePage = useLocation().pathname.split('/')[1].toLowerCase()==='profile'; // to differentiate between profile and signup forms
	const cscRef = useRef(false);
	const [country, setCountry] = useState(''); // whole country object
	const [state, setState] = useState('');     // whole state object
	const [city, setCity] = useState('');       // whole city object
	const [nigeriaData, setNigeriaData] = useState(null); // store NG picker data
	const [csc, setCSC] = useState(null);         // combined country-state-city string
	const [cscFormData, setCSCFormData] = useState({})
	const [NGStates, setNGStates] = useState(null);

	// ✅ Update Nigeria data when NigeriaLocationPicker changes
	const handleNigeriaLocationChange = (data) => {
		setNigeriaData(data); // { state, stateCode, lga, area }
	};

	// Initialize Nigeria picker once
	const nigeriaPicker = useNigeriaLocationPicker(
		handleNigeriaLocationChange, // use callback to get data from child
		country, // get updated country value from child
		(pickSetters) => setNGStates(pickSetters), // receive setter from child
	);

	const nigeriaNG = country?.name?.toLowerCase() === "nigeria"
	const updateFormData = () => {
		setCSCFormData(prev => ({
			...prev,

			// country
			country: country?.name||null,
			countryId: country?.id||null,
			phoneCode: country?.phone_code||null,
			currency: country?.currency||null,
			currencyName: country?.currency_name||null,
			currencySymbol: country?.currency_symbol||null,
			countryEmoji: country?.emoji||null,
			hasStates: country?.hasStates||false,

			// // state
			// state: country?.hasStates?(state?.name):null,
			// stateId: country?.hasStates?(state?.id):null,
			// stateCode: country?.hasStates?(state?.state_code):null,
			// hasCities: state?.hasCities||false,

			// // city
			// city: state?.hasCities?(city?.name):null,
			// cityId: state?.hasCities?(city?.id):null,

			// If Nigeria, use nigeriaData; else use normal state/city
			// state
			state: (nigeriaNG)
				? nigeriaData?.state
				: (country?.hasStates) ? state?.name : null,
			stateCode: (nigeriaNG)
				? nigeriaData?.stateCode
				: (country?.hasStates) ? state?.state_code : null,
			stateId: (country?.hasStates) ? state?.id : null,
			hasCities: state?.hasCities || false,

			// city
			city: (state?.hasCities) ? city?.name : null,
			cityId: state?.hasCities?(city?.id):null,

			// lga
			lga: nigeriaData?.lga || null,

			// area if Nigeria
			subArea: nigeriaData?.area || null,
		}))
	}

	useEffect(() => {
		if (csc&&!cscRef.current) {
			console.log('Prefilling CSC data from prop:', csc)
			if (csc.country) {
				setCountry({
					name: csc?.country,
					phone_code: csc?.phoneCode,
					currency: csc?.currency||null,
					currency_name: csc?.currencyName||null,
					currency_symbol: csc?.currencySymbol||null,
					emoji: csc?.countryEmoji||null,
					id: csc?.countryId,
					hasStates: csc?.hasStates,
				})
			}
			if (csc.state) {
				setState({
					name: csc?.state,
					state_code: csc.stateCode,
					id: csc?.stateId,
					hasCities: csc?.hasCities,
				})
			}
			if (csc.city) {
				setCity({
					name: csc?.city,
					id: csc?.cityId,
				})
			}
			cscRef.current = true; // prevent future overwrites
		}
	}, [csc])

	useEffect(() => {
		setCscRequiredFieldsGood(
			!!(
				cscFormData?.country &&
				(
					// Special handling for Nigeria
					(cscFormData?.country?.toLowerCase() === "nigeria" &&
						cscFormData?.state &&
						cscFormData?.lga &&
						cscFormData?.subArea
					)
					||
					// Default for other countries
					(
						cscFormData?.country !== "Nigeria" &&
						(!cscFormData?.hasStates || cscFormData?.state) &&
						(!cscFormData?.hasCities || cscFormData?.city)
					)
				)
			)
		);
	}, [cscFormData])

	// Re-enable resets if the user changes country on profile page
	useEffect(() => {
		if (profilePage && cscRef.current) {
			// If the selected country is different from the prefilled one, unlock state and city resets
			if (country && country.id !== csc?.countryId) {
				cscRef.current = false;
			}

			// If the selected state is different from the prefilled one, unlock city reset
			if (state && state.id !== csc?.stateId) {
				cscRef.current = false; // allow city to reset
			}
		}
	}, [country, state, profilePage, csc]);

	useEffect(() => {
		if (!profilePage&&(country?.name||country?.hasStates===false)) {
			setState('');
			setCity('');
		}
	}, [country])

	useEffect(() => {
		if (!profilePage&&(state?.name||state?.hasCities===false)) {
			setCity('');
		}
	}, [state])

	// updates country, state, city and image details in formData whenever they change
	useEffect(() => {
		updateFormData()
		if (country?.name?.toLowerCase() !== 'nigeria') {
			// Clear if another country is selected
			setNigeriaData(null);
		}
	}, [country, state, city, nigeriaData])

	// console.log({nigeriaNG, nigeriaData})
	// console.log({country})
	return {
		cscFormData,
		cscRequiredFieldsGood,
		setCountry,
		setState,
		setCity,
		setCSC,
		NGStates,
		CountryCompSelect: (
			<CountrySelect
			value={country}
			onChange={(val) => {
				console.log('Country changed to:', val)
				setCountry(val)
			}}
			placeHolder='Select Country' />
		),
		StateCompSelect: nigeriaNG ?
			(
				nigeriaPicker.NGStateCompSelect
			)
			:
			(
				<StateSelect
				countryid={country?.id}
				key={country?.id || "no-country"} // to reset when country changes
				value={state}
				onChange={(val) => setState(val)}
				placeHolder='Select State' />
			),
		CityCompSelect: nigeriaNG ?
				(
					nigeriaPicker.NGLGACompSelect
				)
			:
			(
				<CitySelect
				countryid={country?.id}
				key={`${country?.id || "no-country"}-${state?.id || "no-state"}`}
				stateid={state?.id}
				value={city}
				onChange={(val) => setCity(val)}
				placeHolder='Select City' />
			),
		AreaCompSelect: nigeriaNG && nigeriaPicker.NGAreaCompSelect,
	};
}


// Reorder fields based on a predefined order array
const reOrderFields = (entries, reOrderFieldsArr) => {
	// console.log({
	// 	entries,
	// 	reOrderFieldsArr
	// })
	// Create a mapping of index for location keys
	const orderMap = Object.fromEntries(
		reOrderFieldsArr.map((key, i) => [key, i])
	);

	return entries.slice().sort(([keyA], [keyB]) => {
		const indexA = orderMap[keyA] ?? Infinity; // non-location = Infinity
		const indexB = orderMap[keyB] ?? Infinity;

		// Compare by location order if both are location keys
		if (indexA !== indexB) {
			return indexA - indexB;
		}

		// Otherwise, preserve original order (stable sort)
		return 0;
	});
};

// Determine if a field should be a textarea based on its name
const toTextArea = (str, textAreaFieldsArr) => {
	const checker = textAreaFieldsArr.includes(str)
	return checker
}

// function to limit input characters and words when plugged into onchange events
const limitInput = (value, maxChars = 80, maxWords = 200, isTextArea = false) => {
	let limitedWordsValue = value ?? '';
	let limitedCharsValue = value ?? '';
	let color = '';

	const maxCharsLimit = isTextArea ? 200 : maxChars;

	// char warning (80% threshold)
	if (maxCharsLimit && limitedCharsValue.length > maxCharsLimit * 0.8) {
		color = '#BC4B51';
	}

	// hard char limit
	if (maxCharsLimit && limitedCharsValue.length > maxCharsLimit) {
		limitedCharsValue = limitedCharsValue.slice(0, maxCharsLimit);
	}

	// safer words count
	const currentTrim = limitedWordsValue.trim();
	const wordsCount = currentTrim ? currentTrim.split(/\s+/).length : 0;
	if (maxWords && wordsCount > maxWords * 0.8) {
		color = '#BC4B51';
	}

	// hard word limit
	let words = currentTrim ? currentTrim.split(/\s+/) : [];
	if (maxWords && words.length > maxWords) {
		words = words.slice(0, maxWords);
		limitedWordsValue = words.join(' ');
	}

	const limitedValue = isTextArea ? limitedWordsValue : limitedCharsValue;
	const charCount = limitedValue.length;
	const wordCount = limitedValue.trim() ? limitedValue.trim().split(/\s+/).length : 0;

	return {
		value: limitedValue,
		charCount,
		wordCount,
		colorIndicator: color,
		maxCharsLimit,
		maxWords,
	};
};

const isEmpty =  (formObj, ignoreID=true) => {
	const emptyCheck = Object.entries(formObj).every(([key, value]) => {
		if (ignoreID && key==='id') return true; // ignore ID field
		const fieldsBool = value === null ||
							value === undefined ||
							(typeof value === 'string' && value.trim() === '') ||
							(Array.isArray(value) && value.length === 0) ||
							(typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
		return fieldsBool // returns every() value to isEmpty fxn
	})
	// if (emptyCheck) {
	// }
	return emptyCheck // returned from every() fxn and passed to calling fxn outside of isEmpty()
};

const getCategories = (categoriesArr) => {
	if (!categoriesArr?.length) return null;
	const categories = categoriesArr.reduce((acc, currVal) => {
		let updated
		if (currVal.subcategories?.length) {
			updated = acc.concat(getCategories(currVal.subcategories))
		} else {
			updated  = acc.concat(currVal.name)
		}
		return updated;
	}, [])
	return categories;
}

const onlyNumbers = (input) => {
	return input.replace(/[^0-9.]/g, '');
}

// basic format check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const useConfirmTotals = (inputValue) => {
	const authFetch = useAuthFetch();
	const [currentTotalsAvailable, setCurrentTotalsAvailable] = useState({});
	const [allGood, setAllGood] = useState(null);

	useEffect(() => {
		if (!inputValue?.length) {
			setAllGood(null);
			return;
		}

		const productIds = inputValue.map(item => item.prdId);
		console.log('Checking available totals for product IDs:', productIds);

		const getUpdatedTotalAvailableItemsFromServer = async () => {
			try {
				const response = await authFetch(`available-totals/`, {
					method: "POST",
					headers: 'no-header',
					body: { productIds },
				});

				const data = await response // .json();
				if (!data) return
				console.log("Available totals from server:", data);

				setCurrentTotalsAvailable(data);

				const match = inputValue.every(item =>
				item?.totalAvailable === data?.[item?.prdId]
				);
				setAllGood(match);

				if (!match) {
					toast.error(
						"Some items in your cart have updated their available quantities. Please review your cart before proceeding to checkout."
					);
					// TODO: fetch updated products and update localStorage here
				}
			} catch (error) {
				console.error("Error fetching available items:", error);
				setAllGood(false);
			}
		};

		getUpdatedTotalAvailableItemsFromServer();
	}, [inputValue]);

	// console.log({ currentTotalsAvailable, allGood });
	return allGood; // null = still checking, true/false = result
};

const usePSPK = () => {
	const authFetch = useAuthFetch();
	const { createSession } = useCreateStorage()
	const pspkRef = useRef(null);
	const [pspk, setPspk] = useState(null)
	const apiUrl = getBaseURL(true) + '/get-paystack-keys/pk/';
	useEffect(() => {
		// console.log('usePSPK hook called')
		const fetchPK = async () => {
			const isPK = createSession.getItem('fpng-pspk')
			if (isPK&&isPK.startsWith('pk_')) {
				// console.log('using existing pspk')
				pspkRef.current = isPK
				setPspk(isPK)
				return
			}
			try {
				console.log('removing old/bad pspk:', isPK?.slice(0, 15))
				createSession.removeItem('fpng-pspk')
				console.log('fetching new pspk')
				const response = await authFetch(apiUrl);
				const data = await response //.json();
				if (!data) return
				createSession.setItem('fpng-pspk', data?.pk);
				pspkRef.current = data?.pk
				setPspk(data?.pk)
				// return data;
			} catch (error) {
				console.error("catch error:", error);
				toast.error('catch error! Failed. Please try again.');
				return null;
			} finally {}
		}
		fetchPK()
	}, [])
	return pspk
}

const useFetchCategories = () => {
	// console.log('useFetchCategories hook called')
	const authFetch = useAuthFetch();
	const { createSession } = useCreateStorage()
	useEffect(() => {
		const fetchCategories = async (endpoint="categories") => {
			const localCategories = localStorage.getItem('fpng-catg');
			// console.log({localCategories})
			if (!localCategories?.length) {
				// console.log('Fetching categories')
				try {
					const categoriesRes = await authFetch(`${endpoint}/`);
					const categoriesData = await categoriesRes // .json();
					if (!categoriesData) return
					// console.log('fetched categories:', categoriesData);
					createSession.setItem('fpng-catg', categoriesData);
					return categoriesData;
				} catch (error) {
					console.error("Error fetching data:", error);
				}
			}
		}
		fetchCategories();
	}, [])
}

// export all functions
export {
	reOrderFields,
	toTextArea,
	limitInput,
	useCountryStateCity,
	isEmpty,
	getCategories,
	onlyNumbers,
	emailRegex,
	useConfirmTotals,
	usePSPK,
	useFetchCategories,
};
