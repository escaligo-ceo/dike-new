import { SetMetadata } from '@nestjs/common';
import { PlanKeys } from '../subscription/plan-type.enum.js';

export const PLANS_KEY = 'plans';
export const Plans = (...plans: PlanKeys[]) => SetMetadata(PLANS_KEY, plans);
