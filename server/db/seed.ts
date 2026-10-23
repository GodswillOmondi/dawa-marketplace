import { db, pool } from './index.js';
import { products, promotions } from './schema.js';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding Dawa Equips commercial appliance catalog...');

  // Ensure tables are cleaned for a fresh pre-seeded experience
  await db.execute(sql`TRUNCATE TABLE email_logs, invoices, orders, promotions, products RESTART IDENTITY CASCADE`);

  const seededProducts: (typeof products.$inferInsert)[] = [
    {
      name: 'La Marzocco Linea Classic 2-Group Commercial Espresso Machine',
      brand: 'La Marzocco',
      category: 'Commercial Espresso Machines',
      price: 380000,
      initialPrice: 460000,
      ratingValue: 4.9,
      variants: [
        { name: '2-Group Dual Boiler (Direct Plumb)', price: 380000 },
        { name: '3-Group High Cup Dual Boiler', price: 470000 }
      ],
      stock: 2,
      specifications: {
        'Condition': 'Refurbished Ex-London Cafe (Full Overhaul)',
        'Boiler System': 'Dual Stainless Steel Boilers (3.4L Coffee + 7L Steam)',
        'Power Supply': '220V - 240V / 3600W (Single Phase or 3-Phase)',
        'Group Heads': 'Saturated Pierced Groups with Mechanical Pre-infusion',
        'Dimensions': '455mm (H) x 690mm (W) x 560mm (D)',
        'Weight': '51 kg Dry Weight',
        'Certification': 'CE / NSF Commercial Sanitary Standard'
      },
      description: 'The definitive benchmark of specialty commercial coffee. Fully descaled, outfitted with brand new silicone group gaskets, stainless steel shower screens, vacuum relief valves, and recalibrated rotary vane pump delivering flat 9-bar pressure.',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=900&q=80'
      ],
      status: 'ACTIVE',
    },
    {
      name: 'Victoria Arduino Black Eagle Gravitech 3-Group T3 Espresso Machine',
      brand: 'Victoria Arduino',
      category: 'Commercial Espresso Machines',
      price: 620000,
      initialPrice: 750000,
      ratingValue: 5.0,
      variants: [
        { name: '3-Group Gravitech Volumetric (Matte Black)', price: 620000 },
        { name: '3-Group Gravitech Volumetric (Polished Chrome)', price: 650000 }
      ],
      stock: 1,
      specifications: {
        'Condition': 'Pristine Refurbished (Ex-Mayfair Roastery)',
        'Technology': 'T3 Multi-Boiler Thermal Stability & Built-in Scales',
        'Boilers': '14L Steam Boiler + 3x 0.7L Independent Coffee Boilers',
        'Power': '7300W / 380V 3-Phase',
        'Steam System': 'Cool-Touch Insulated Steam Wands with High-Flow Tips',
        'Display': 'Digital TFT Screen with Real-Time Shot Extraction Graphs'
      },
      description: 'The world barista championship standard. Incorporates gravimetric scale technology integrated directly into the drip tray grid, allowing baristas to dose by exact gram yield in liquid espresso rather than time.',
      images: [
        'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80'
      ],
      status: 'ACTIVE',
    },
    {
      name: 'Nuova Simonelli Appia II Compact 2-Group Commercial Machine',
      brand: 'Nuova Simonelli',
      category: 'Commercial Espresso Machines',
      price: 245000,
      initialPrice: 290000,
      ratingValue: 4.7,
      variants: [
        { name: 'Standard 2-Group Compact Red', price: 245000 },
        { name: 'Standard 2-Group Compact Black', price: 245000 }
      ],
      stock: 3,
      specifications: {
        'Condition': 'Refurbished Ex-Boutique Bakery (Like New)',
        'Width': '550mm Ultra-Compact Footprint',
        'Boiler': '7.5 Liters Copper Heat Exchanger Boiler',
        'Power': '2900W / 230V Single Phase',
        'Special Feature': 'Soft Infusion System (SIS) for consistent extraction'
      },
      description: 'Designed specifically for spaces where counter depth and width are at a premium without compromising dual-group simultaneous brewing and milk steaming power.',
      images: [
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80'
      ],
      status: 'ACTIVE',
    },
    {
      name: 'Mahlkönig EK43 Commercial Specialty Coffee Shop Grinder',
      brand: 'Mahlkönig',
      category: 'Grinders',
      price: 195000,
      initialPrice: 230000,
      ratingValue: 4.9,
      variants: [
        { name: 'Classic Tall Black (1500g Hopper)', price: 195000 },
        { name: 'Short Hopper White (800g Hopper)', price: 195000 }
      ],
      specifications: {
        'Condition': 'Refurbished (New 98mm Cast Steel Burrs)',
        'Burr Size': '98mm Premium German Cast Steel Flat Burrs',
        'Grinding Capacity': '25 grams / second (Turkish to Cold Brew)',
        'Hopper Capacity': '1500g transparent bean container',
        'Motor': '1300W Heavy Duty Continuous Duty Industrial Motor'
      },
      description: 'Unmatched unimodal particle size distribution for the highest clarity in espresso and batch brew extraction. Fresh shear plate installed, motor bearings oiled, and dial recalibrated.',
      images: [
        'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80'
      ],
      stock: 2,
      status: 'ACTIVE',
    },
    {
      name: 'Mazzer Super Jolly V Pro Electronic On-Demand Grinder',
      brand: 'Mazzer',
      category: 'Grinders',
      price: 110000,
      initialPrice: 135000,
      ratingValue: 4.8,
      variants: [
        { name: 'Matte Black Electronic Touchpad', price: 110000 },
        { name: 'Silver Aluminum Electronic Touchpad', price: 110000 }
      ],
      specifications: {
        'Condition': 'Factory Refurbished (Zero Retention Chute)',
        'Burrs': '64mm Hardened Steel Flat Burrs',
        'Dosing': '19 Programmable Doses with 1/100th second accuracy',
        'RPM': '1400 RPM @ 350W',
        'Daily Output': 'Recommended up to 4kg/day'
      },
      description: 'Commercial on-demand grinder featuring anti-static clump breaker, low-retention aluminum grinding chamber, and stepless micrometric grind adjustment collar.',
      images: [
        'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?auto=format&fit=crop&w=900&q=80'
      ],
      stock: 4,
      status: 'ACTIVE',
    },
    {
      name: 'Winterhalter UC-M Commercial Undercounter Warewasher & Glasswasher',
      brand: 'Winterhalter',
      category: 'Ovens & Dishwashers',
      price: 280000,
      initialPrice: 340000,
      ratingValue: 4.6,
      variants: [
        { name: '500x500mm Basket with Integrated Softener', price: 280000 }
      ],
      specifications: {
        'Condition': 'Refurbished Ex-Hospitality Group (Thoroughly Descaled)',
        'Rack Size': '500 x 500 mm Standard Commercial Basket',
        'Cycle Times': 'Variable 60s, 90s, 120s Sanitizing Cycles',
        'Washing Field': 'Elliptical Wash Fields with Top & Bottom Spray Arms',
        'Sanitization': '85°C High-Temp Hygiene Rinse'
      },
      description: 'Commercial glass and warewasher engineered in Germany. Quadruple wash-water filtration keeps glassware gleaming without manual polishing. Out of stock due to high demand.',
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80'
      ],
      stock: 0, // OUT OF STOCK test case
      status: 'OUT_OF_STOCK',
    },
    {
      name: 'La Marzocco OEM Brass Bottomless Naked Portafilter & Valve Kit',
      brand: 'La Marzocco',
      category: 'Spare Parts',
      price: 18500,
      initialPrice: 22000,
      ratingValue: 4.9,
      variants: [
        { name: 'Bottomless Naked with Walnut Handle', price: 18500 },
        { name: 'Double Spouted Chrome with Walnut Handle', price: 19500 }
      ],
      specifications: {
        'Condition': 'Brand New Commercial Genuine Replacement Part',
        'Material': 'Solid Forged Chrome-Plated Brass & Natural Italian Walnut',
        'Filter Basket': 'Includes 21g Precision Ridgeless IMS Competition Basket',
        'Compatibility': 'Linea Classic, Linea Mini, PB, Strada, FB80, GS3'
      },
      description: 'Essential diagnostic and brewing tool for head baristas. Exposes channeling and ensures perfectly even extraction distribution across the espresso puck.',
      images: [
        'https://images.unsplash.com/photo-1518057111178-44a106bad636?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80'
      ],
      stock: 12,
      status: 'ACTIVE',
    }
  ];

  const insertedProducts = await db.insert(products).values(seededProducts).returning();
  console.log(`✅ Inserted ${insertedProducts.length} commercial appliances.`);

  // Insert active Flash Sale and Seasonal Deal banners linked to inserted products
  const lineaClassic = insertedProducts.find(p => p.name.includes('Linea Classic'));
  const blackEagle = insertedProducts.find(p => p.name.includes('Black Eagle'));

  if (lineaClassic && blackEagle) {
    const seededPromotions = [
      {
        title: 'FLASH SALE: 17% OFF LA MARZOCCO LINEA CLASSIC',
        subtitle: 'Certified Ex-UK Refurbished • Fully Overhauled with New Seals & 9-Bar Pump • Limited 2 Units',
        promoType: 'FLASH_SALE',
        templateId: 'espresso-gold',
        productId: lineaClassic.id,
        promoPrice: 380000,
        isActive: true,
      },
      {
        title: 'SEASONAL DEAL: VICTORIA ARDUINO GRAVITECH CHAMPIONSHIP SPECIAL',
        subtitle: 'Save 130,000 KES • Dual Gravimetric Trays & T3 Multi-Boilers • Ready For Immediate Delivery',
        promoType: 'SEASONAL_DEAL',
        templateId: 'sage-editorial',
        productId: blackEagle.id,
        promoPrice: 620000,
        isActive: true,
      }
    ];

    const insertedPromotions = await db.insert(promotions).values(seededPromotions).returning();
    console.log(`✅ Inserted ${insertedPromotions.length} promotional banners.`);
  }

  console.log('🎉 Seeding completed successfully!');
  await pool.end();
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
