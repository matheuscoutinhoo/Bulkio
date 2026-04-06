import { bodyWeightRepository } from '../repositories/bodyWeightRepository';
import { CreateBodyWeightInput } from '../models/schemas';
import { NotFoundError, ForbiddenError } from '../utils/errors';

async function assertRecordOwnership(userId: string, recordId: string) {
   const record = await bodyWeightRepository.findById(recordId);
   if (!record) throw new NotFoundError('Body weight record');
   if (record.userId !== userId) throw new ForbiddenError();
   return record;
}

export const bodyWeightService = {
   async findAll(userId: string, page: number, limit: number) {
      const [records, total] = await bodyWeightRepository.findAllByUser(userId, page, limit);
      return {
         records,
         total,
         page,
         totalPages: Math.ceil(total / limit),
      };
   },

   async create(userId: string, data: CreateBodyWeightInput) {
      return bodyWeightRepository.create(userId, data);
   },

   async delete(userId: string, id: string) {
      await assertRecordOwnership(userId, id);
      return bodyWeightRepository.delete(id);
   },
};
