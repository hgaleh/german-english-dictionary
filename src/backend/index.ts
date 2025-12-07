import express from 'express';
import { search } from './api/search';
import { join } from 'path';

const app = express();

app.use(express.static(join(__dirname, 'ui')));

app.get('/query', async (req, res) => {
	const keyword: string = req.query.q as string;

	const result = await search(keyword);

	res.send({ 
		translation: result,
		keyword
	});
});

app.listen(3000, () => {
	console.log('Server running on http://localhost:3000');
});

