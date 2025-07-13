import 'module-alias/register';
import express from 'express';
import { search } from 'api/search';

const app = express();

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
	const keyword: string = req.query.q as string;
	const result = await search(keyword);

	res.render('index', { translation: result });
});

app.listen(3000, () => {
	console.log('Server running on http://localhost:3000');
});
