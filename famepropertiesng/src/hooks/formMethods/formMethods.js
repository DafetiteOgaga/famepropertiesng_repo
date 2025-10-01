import React, { useState, useEffect, useRef } from 'react';
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import 'react-country-state-city/dist/react-country-state-city.css';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBaseURL } from '../fetchAPIs';

const baseURL = getBaseURL();

const useCountryStateCity = () => {
	const profilePage = useLocation().pathname.split('/')[1].toLowerCase()==='profile'; // to differentiate between profile and signup forms
	const cscRef = useRef(false);
	const [country, setCountry] = useState(''); // whole country object
	const [state, setState] = useState('');     // whole state object
	const [city, setCity] = useState('');       // whole city object
	const [csc, setCSC] = useState(null);         // combined country-state-city string
	const [cscFormData, setCSCFormData] = useState({})

	const updateFormData = () => {
		// console.log('Updating form data with country, state, city changes...');
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

			// state
			state: country?.hasStates?(state?.name):null,
			stateId: country?.hasStates?(state?.id):null,
			stateCode: country?.hasStates?(state?.state_code):null,
			hasCities: state?.hasCities||false,

			// city
			city: state?.hasCities?(city?.name):null,
			cityId: state?.hasCities?(city?.id):null,
		}))
	}

	useEffect(() => {
		// console.log('in useefect:', {csc})
		if (csc&&!cscRef.current) {
			// console.log('csc exists, not overwriting with country/state/city changes')
			if (csc.country) {
				// console.log('setting country from userInfo...')
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
				// console.log('setting state from userInfo...')
				setState({
					name: csc?.state,
					state_code: csc.stateCode,
					id: csc?.stateId,
					hasCities: csc?.hasCities,
				})
			}
			if (csc.city) {
				// console.log('setting city from userInfo...')
				setCity({
					name: csc?.city,
					id: csc?.cityId,
				})
			}
			cscRef.current = true; // prevent future overwrites
		}
	}, [csc])

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

	// // Re-enable resets if the user changes state on profile page
	// useEffect(() => {
	// 	if (profilePage && cscRef.current) {
	// 		if (state && state.id !== csc?.stateId) {
	// 			cscRef.current = false; // allow city to reset
	// 		}
	// 	}
	// }, [state, profilePage, csc]);

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
	}, [country, state, city])

	// console.log('#####', {country, state, city})
	// console.log('in comp', {csc})
	// console.log({location})
	// console.log({cscref: cscRef.current})
	return {
		cscFormData,
		setCountry,
		setState,
		setCity,
		setCSC,
		CountryCompSelect: (
			<CountrySelect
			value={country}
			onChange={(val) => setCountry(val)}
			placeHolder='Select Country' />
		),
		StateCompSelect: (
			<StateSelect
			countryid={country?.id}
			key={country?.id || "no-country"} // to reset when country changes
			value={state}
			onChange={(val) => setState(val)}
			placeHolder='Select State' />
		),
		CityCompSelect: (
			<CitySelect
			countryid={country?.id}
			key={`${country?.id || "no-country"}-${state?.id || "no-state"}`}
			stateid={state?.id}
			value={city}
			onChange={(val) => setCity(val)}
			placeHolder='Select City' />
		),
	};
}


// Reorder fields based on a predefined order array
const reOrderFields = (entries, reOrderFieldsArr) => {
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
	// console.log({str, checker})
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
	// const maxValue = isTextArea ? 200 : maxChars;

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
	if (emptyCheck) {
		// console.log(`Form ID ${formObj.id} is completely empty and should be skipped.`);
	}
	return emptyCheck // returned from every() fxn and passed to calling fxn outside of isEmpty()
};

const getCategories = (categoriesArr) => {
	if (!categoriesArr?.length) return null;
	const categories = categoriesArr.reduce((acc, currVal) => {
		let updated
		if (currVal.subcategories?.length) {
			// console.log('skipping:', currVal.name)
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
	const [currentTotalsAvailable, setCurrentTotalsAvailable] = useState({});
	const [allGood, setAllGood] = useState(null);

	useEffect(() => {
		if (!inputValue?.length) {
			setAllGood(null);
			return;
		}

		const productIds = inputValue.map(item => item.prdId);

		const getUpdatedTotalAvailableItemsFromServer = async () => {
			try {
				const response = await fetch(`${baseURL}/available-totals/`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ productIds }),
				});

				if (!response.ok) throw new Error("Network response was not ok");

				const data = await response.json();
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

	console.log({ currentTotalsAvailable, allGood });
	return allGood; // null = still checking, true/false = result
};

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
};
