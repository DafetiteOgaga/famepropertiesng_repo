import React, { useState, useEffect } from 'react';
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import 'react-country-state-city/dist/react-country-state-city.css';

const useCountryStateCity = () => {
	const [country, setCountry] = useState(''); // whole country object
	const [state, setState] = useState('');     // whole state object
	const [city, setCity] = useState('');       // whole city object
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
		if (country?.name||country?.hasStates===false) {
			setState('');
			setCity('');
		}
	}, [country])

	useEffect(() => {
		if (state?.name||state?.hasCities===false) {
			setCity('');
		}
	}, [state])

	// updates country, state, city and image details in formData whenever they change
	useEffect(() => {
		updateFormData()
	}, [country, state, city])

	// console.log('#####', {country, state, city})
	return {
		cscFormData,
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
	return textAreaFieldsArr.includes(str)
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
export {
	reOrderFields,
	toTextArea,
	limitInput,
	useCountryStateCity,
};
