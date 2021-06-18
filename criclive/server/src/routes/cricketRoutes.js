const router = require('express').Router();
const ctrl = require('../controllers/cricketController');

// Matches
router.get('/matches/live', ctrl.live);
router.get('/matches/upcoming', ctrl.upcoming);
router.get('/matches/finished', ctrl.finished);
router.get('/matches/:id', ctrl.matchInfo);

// Series
router.get('/series', ctrl.seriesList);
router.get('/series/:id', ctrl.seriesInfo);
router.get('/series/:id/points', ctrl.pointsTable);
router.get('/points', ctrl.pointsTable); // default ICC WTC

// Players
router.get('/players', ctrl.searchPlayers);
router.get('/players/:id', ctrl.playerInfo);

// Cache management (handy for dev / proves the lesson)
router.get('/cache/stats', ctrl.cacheStats);
router.delete('/cache', ctrl.cacheFlush);

module.exports = router;
