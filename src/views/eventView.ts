import { Request, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection URL
const url = 'your_mongodb_connection_url';
const dbName = 'your_database_name';
const client = new MongoClient(url);

async function getEventView(req: Request, res: Response) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('events');

        const products = await collection.find({}).toArray();

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching products');
    } finally {
        await client.close();
    }
}

export { getEventView };