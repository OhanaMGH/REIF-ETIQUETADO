import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = "mongodb://localhost:27017/";

export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("REIF_test");
    // Consultamos la colección "imagenes" que definimos en el backend
    const imagenes = await db.collection("imagenes")
      .find({})
      .sort({ fecha_registro: -1 })
      .toArray();

    return NextResponse.json(imagenes);
  } catch (error) {
    console.error("Error en API imagenes:", error);
    return NextResponse.json({ error: "Fallo al conectar con MongoDB" }, { status: 500 });
  } finally {
    await client.close();
  }
}