const axios = require('axios');
const config = require('./config.json');
const cheerio = require('cheerio');

const NodeCache = require('node-cache');
const cache = new NodeCache();

const parseResponseData = (data) => {

    const $ = cheerio.load(data);
    const menu = $('.restaurant-menu');


    const state = {
        category: {},
        menu: []
    };

    menu.children().each((i, el) => {
        const tag = el.name;
        const value = $(el).html();

        if (tag === 'h2') {
            state.category.type = value;
            state.category.meals = [];
        } else if (tag === 'h3') {
            const meal = { name: value }

            const badges = [];
            let prevEl = $(el).prev();
            while (prevEl[0] && prevEl[0].name === 'img') {
                badges.push({
                    name: $(prevEl).attr('alt'),
                    url: config.baseUrl + $(prevEl).attr('src')
                });
                prevEl = prevEl.prev();
            }

            if (badges.length > 0) {
                meal.badges = badges;
            }

            const nextElements = [
                $(el).next(),
                $(el).next().next()
            ];

            const nameEngRaw = nextElements.find(e => (e[0] && e[0].name === 'h4'));
            if (nameEngRaw !== undefined) {
                meal.nameEng = nameEngRaw.text();
            }

            const titleRaw = nextElements.find(e => (e[0] && e[0].name === 'p'));
            if (titleRaw !== undefined) {
                meal.title = titleRaw.text();
            }

            state.category.meals.push(meal);
        } else if (tag === 'hr') {
            let category = {};
            state.menu.push(Object.assign(category, state.category));
        }

    });

    if (state.category.type !== undefined) {
        let category = {};
        state.menu.push(Object.assign(category, state.category));
        delete state.category;
    }

    return state;
};

const fetchMenu = async (date) => {
    let url = config.menuUrl;
    if (date) {
        url += '/date/' + date;
    }

    if (cache.has(url)) {
        return {
            ...cache.get(url),
            sodexoResponseMs: 0
        }
    } else {
        const requestStart = Date.now();
        const { data } = await axios.get(url);
        const requestEnd = Date.now();

        if (/Wybrane menu nie jest jeszcze gotowe./.test(data)) {
            throw new Error('Menu not ready!');
        }
        const menu = parseResponseData(data);

        cache.set(url, menu, 3600);

        return {
            ...menu,
            sodexoResponseMs: requestEnd - requestStart
        }
    }
};

module.exports = fetchMenu;