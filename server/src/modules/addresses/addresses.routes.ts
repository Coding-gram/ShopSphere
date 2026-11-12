import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { addAddress, editAddress, listAddresses, removeAddress } from './addresses.controller.js';
import { addressParamsSchema, createAddressSchema, updateAddressSchema } from './addresses.validators.js';

const router = Router();

router.use(protect);
router.get('/', listAddresses);
router.post('/', validate(createAddressSchema), addAddress);
router.put('/:addressId', validate(updateAddressSchema), editAddress);
router.delete('/:addressId', validate(addressParamsSchema), removeAddress);

export default router;
