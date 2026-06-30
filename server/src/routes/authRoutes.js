const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 chars'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be ≥ 6 chars'),
  ],
  ctrl.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  ctrl.login
);

router.get('/me', protect, ctrl.me);
router.put('/follow-match/:id', protect, ctrl.toggleFollowMatch);
router.put('/favorite-team/:team', protect, ctrl.toggleFavoriteTeam);

module.exports = router;
