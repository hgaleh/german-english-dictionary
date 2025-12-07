import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import './ui.scss';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";

import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { LeoResult } from '../model/leo-result';
import { Pair } from '../model/pair';

interface AppState {
	showNotif: boolean;
	keyword: string;
	translation: LeoResult;
	text: string;
}

interface Action {
	type: string;
	payload: any;
}

function appReducer(prevState: AppState, action: Action): AppState {
	switch (action.type) {
		case 'text':
			return { ...prevState, text: action.payload };
		case 'data':
			return { ...prevState, translation: action.payload }
		case 'notif':
			return { ...prevState, showNotif: action.payload }
		default:
			return prevState;
	}
}

function App() {
	const [searchParam, setSearchParam] = useSearchParams();
	const [state, dispatch] = useReducer(appReducer, {
		keyword: '',
		translation: {},
		text: '',
		showNotif: false
	});

	const keyword = useMemo(() => {
		return searchParam.get('q');
	}, [searchParam]);

	useEffect(() => {
		const params = new URLSearchParams({
			q: keyword || ''
		});

		dispatch({ type: 'text', payload: keyword });

		fetch(`/query?${params.toString()}`)
			.then((res) => res.json())
			.then((json) => dispatch({ type: 'data', payload: json.translation }))
			.catch((err) => console.error(err));
	}, [keyword, dispatch])

	const onPartClick = useCallback((link: HTMLLinkElement) => {
		const text = link.textContent?.trim() || '';
		navigator.clipboard.writeText(text).then(() => {
			dispatch({ type: 'notif', payload: true });
			setTimeout(() => {
				dispatch({ type: 'notif', payload: false });
			}, 1000);
		});
		return false;
	}, [dispatch])

	const onExampleClick = useCallback((link: HTMLLinkElement) => {
		const text = link.textContent?.trim() || '';
		const title = link.title;
		const keyword = state.text;

		navigator.clipboard.writeText(`${text}\t${title}\t${keyword}`).then(() => {
			// Find the notification sibling
			dispatch({ type: 'notif', payload: true });
			setTimeout(() => {
				dispatch({ type: 'notif', payload: false });
			}, 1000);
		});
		return false;
	}, [state.text]);

	const changeText = useCallback((e: any) => {
		e.preventDefault();
		dispatch({ type: 'text', payload: e.target.value });
	}, [dispatch]);

	const search = useCallback((e: any) => {
		if (e.key === 'Enter') {
			setSearchParam({ q: state.text });
		}
	}, [setSearchParam, state.text]);

	const goto = useCallback((link: string) => {
		setSearchParam({ q: link });
	}, [setSearchParam])

	return (
		<>
			{state.showNotif && <span id="notif">Copied!</span>}
			<input translate="no" id="txtSearch" type="text" value={state.text} onChange={changeText} onKeyUp={search}></input>
			{state.translation.base && <Links title='Base forms' search={goto} links={state.translation.base} />}
			{state.translation.phrase && <Part name='Phrases / Collocations' data={mapDataDe(state.translation.phrase)} onclick={onPartClick} translate={false} />}
			{state.translation.subst && <Part name='Nouns' data={mapDataEn(state.translation.subst)} onclick={onPartClick} translate={true} />}
			{state.translation.verb && <Part name='Verbs' data={mapDataEn(state.translation.verb)} onclick={onPartClick} translate={true} />}
			{state.translation.adjadv && <Part name='Adjectives / Adverbs' data={mapDataEn(state.translation.adjadv)} onclick={onPartClick} translate={true} />}
			{state.translation.praep && <Part name='Prepositions / Pronouns' data={mapDataEn(state.translation.praep)} onclick={onPartClick} translate={true} />}
			{state.translation.definition && <Part name='Definitions' data={mapDataEn(state.translation.definition)} onclick={onPartClick} translate={true} />}
			{state.translation.example && <Part name='Examples' data={mapDataDe(state.translation.example)} onclick={onExampleClick} translate={false} />}
			{state.translation.sim && <Links title='Similar words' search={goto} links={state.translation.sim} />}
		</>
	);
}

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();


function Links({ title, links, search }: { title: string, links: string[], search: any }) {

	const linksTransform = useMemo(() => links.map((link, i) => {
		return (
			<li key={i}>
				<a href="#" onClick={() => { search(link); return false; }}>
					{link}
				</a>
			</li>
		);
	}), [links, search]);

	return (
		<>
			<h4>{title}</h4>
			<ul translate="no">
				{linksTransform}
			</ul>
		</>
	);
}

function Part({ name, data, translate, onclick }: { name: string, data: { title: string[], text: string[] }[], translate: boolean, onclick: any }) {
	return (
		<>
			<h4>{name}</h4>
			<ul>
				{data.map((row, i) => (
					<li key={i}>
						<a
							className="noclick"
							translate={translate ? "no" : "yes"}
							onClick={(e) => onclick(e.currentTarget)}
							title={row.title.join(", ")}
						>
							{row.text
								.map((t, idx) => {
									const html = t.replace(
										/\[([^\]]+)\]/g,
										'<span class="bracketed">[$1]</span>'
									);

									return (
										<span
											key={idx}
											translate={translate ? "yes" : "no"}
											dangerouslySetInnerHTML={{ __html: html }}
										/>
									);
								})
								.flatMap((c, i) => i === 0 ? [c] : [" - ", c])
							}
						</a>
					</li>
				))}
			</ul>
		</>
	);
}

function mapDataEn(data: Pair[]) {
	return data.map(row => ({ title: row.de, text: row.en }));
}

function mapDataDe(data: Pair[]) {
	return data.map(row => ({ title: row.en, text: row.de }));
}