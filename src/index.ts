import 'module-alias/register';
import express from 'express';
import { search } from 'api/search';
import { Pair } from 'api/search';

const app = express();

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
	const keyword: string = req.query.q as string;
	const result = await search(keyword);

	res.render('index', { translation: result, mapDataEn, mapDataDe });
});

app.listen(3000, () => {
	console.log('Server running on http://localhost:3000');
});

function mapDataEn(data: Pair[]) {
	return data.map(row => ({ title: row.de, text: row.en }));
}

function mapDataDe(data: Pair[]) {
	return data.map(row => ({ title: row.en, text: row.de }));
}