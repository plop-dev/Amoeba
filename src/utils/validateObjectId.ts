import mongoose from 'mongoose';

const {
	Types: { ObjectId },
} = mongoose;
export const validateObjectId = (id: string) => ObjectId.isValid(id) && new ObjectId(id).toString() === id;
