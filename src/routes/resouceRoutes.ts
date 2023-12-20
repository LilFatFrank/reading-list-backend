import { Router } from 'express';
import { addPoint, addResource, getResources } from '../controllers/resourceController';

const router = Router();

router.post('/resource', addResource);
router.post('/get', getResources);
router.post('/add', addPoint);

export default router;
