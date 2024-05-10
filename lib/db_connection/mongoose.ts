import mongoose from 'mongoose';

let isConnetcted = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URI) return console.log('MONGODB_URI is not defined');

    if (isConnetcted) return console.log('=> using existing db connection');

    try {
        await mongoose.connect(process.env.MONGODB_URI)

        isConnetcted = true
        console.log('MongoDB Connected')

    } catch (error) {
        console.log(error);   
    }
}