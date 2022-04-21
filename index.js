const express = require('express');
const fetchMenu = require('./sodexoClient');
const logger = require('./logger');

const app = express();

app.get('/:date?', async (req, res) => {
    const { date } = req.params;
    if (date !== undefined && !/\d{4}-\d{2}-\d{2}/.test(date)) {
        return res.json({
            error: "Invalid date format, please use YYYY-MM-DD"
        }).status(200);
    }

    try {
        const menu = await fetchMenu(date);
        return res.json(menu).status(200);
    } catch (err) {
        logger.error(err.message);
        return res.json({
            error: err.message
        }).status(400);
    }
});

app.use((req, res) => {
    res.sendStatus(404);
});

const port = process.env.PORT || 8090;
app.listen(port, (server) => {
    logger.info(`Server started, running on port ${port}`);
});