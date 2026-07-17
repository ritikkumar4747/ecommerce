import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath }); else dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error('MONGO_URI not set'); process.exit(1); }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to DB:', db.databaseName);

    const products = [
      {
        name: 'Aurora Sport GT',
        description: 'Limited edition luxury sports car model — sleek lines and roaring performance.',
        price: 2500000,
        category: 'cars',
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1549921296-3a29f3c1f0a5?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Orbit Electric Coupe',
        description: 'Futuristic electric coupe with cutting-edge design and sustainable materials.',
        price: 1800000,
        category: 'cars',
        stock: 3,
        imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Phantom Centurion',
        description: 'A masterclass in luxury motoring. Custom wood paneling, silent cabin, and a powerful twin-turbo V12 engine.',
        price: 3200000,
        category: 'cars',
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Vortex Roadster',
        description: 'An open-top electric supercar with active aerodynamics, 0-100 in 1.9s, and a bespoke carbon fiber chassis.',
        price: 1950000,
        category: 'cars',
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Nocturne Chrono Watch',
        description: 'Handcrafted automatic chronograph with brushed steel case and leather strap.',
        price: 12500,
        category: 'watches',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1519741498534-53a9f1a6b442?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Horizon Astrolabe Watch',
        description: 'Bespoke tourbillon movement with moonphase calendar and solid gold casing. Individually numbered and assembled.',
        price: 48000,
        category: 'watches',
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Zenith Oceanfarer Chrono',
        description: 'Diver watch water-resistant to 300m, featuring an ocean-blue dial, ceramic bezel, and steel links.',
        price: 8900,
        category: 'watches',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Voyage Leather Tote',
        description: 'Premium full-grain leather tote, perfect for travel and everyday elegance.',
        price: 650,
        category: 'bags',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1531993226953-1c7f3d7c7b2b?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Sienna Satchel Bag',
        description: 'Hand-stitched calfskin leather satchel with brushed brass fixtures and suede-lined compartments.',
        price: 1200,
        category: 'bags',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Eclipse Canvas Duffle',
        description: 'Premium travel duffle bag crafted in carbon-coated canvas with waterproof zippers and leather handles.',
        price: 950,
        category: 'bags',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Malibu Cliffside Villa',
        description: 'Breathtaking architectural masterpiece overlooking the Pacific, with infinity pool and private beach access.',
        price: 8500000,
        category: 'homes',
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Kyoto Zen Sanctuary',
        description: 'A beautifully restored traditional estate in the hills of Kyoto, featuring a private dry landscape garden.',
        price: 4200000,
        category: 'homes',
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Alpine Chalet & Spa',
        description: 'Luxury ski-in/ski-out chalet in Zermatt with panoramic views of the Matterhorn and indoor swimming pool.',
        price: 5500000,
        category: 'homes',
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Santorini Cliffside Retreat',
        description: 'An iconic white-washed dome villa carved into the volcanic cliffs of Oia, with panoramic caldera views.',
        price: 12000000,
        category: 'homes',
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Manhattan Sky Penthouse',
        description: 'Three-story penthouse above Central Park, featuring private elevator, 20-foot ceilings, and full wrap-around terrace.',
        price: 28500000,
        category: 'homes',
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Stellar Aviator Sunglasses',
        description: 'Classic aviator frame with polarized lenses and titanium accents.',
        price: 220,
        category: 'accessories',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1503342452485-86f7b5b4f9a0?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Elegance Slim Wallet',
        description: 'Minimalist slim wallet in pebble leather with RFID protection.',
        price: 85,
        category: 'accessories',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Nero Gold Cufflinks',
        description: '18k yellow gold cufflinks with inset black onyx stone, perfect for bespoke black-tie tailoring.',
        price: 350,
        category: 'accessories',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1200&auto=format&fit=crop'
      },
      {
        name: 'Sovereign Silk Scarf',
        description: 'Pure mulberry silk scarf handmade in Italy, displaying a rich geometric gold-and-black nautical pattern.',
        price: 280,
        category: 'accessories',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1589363486339-8588f85f54aa?w=1200&auto=format&fit=crop'
      }
    ];

    let upserted = 0;
    for (const p of products) {
      const res = await db.collection('products').updateOne({ name: p.name }, { $set: p }, { upsert: true });
      if (res.upsertedCount || res.modifiedCount) upserted++;
    }
    console.log('Seed completed. Upserted/modified:', upserted);
    const total = await db.collection('products').countDocuments();
    console.log('Products in collection now:', total);
  } catch (err) { console.error(err); }
  finally { await client.close(); }
}

run();
