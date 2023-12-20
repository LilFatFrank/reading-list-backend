import { Router } from 'express';
import { addResource, getResources } from '../controllers/resourceController';

const router = Router();

router.post('/resource', addResource);
router.post('/get', getResources);

export default router;
