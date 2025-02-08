const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const hospitalData = require('./hospitalData');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

const categories = ['Equipment', 'PPE', 'Supplies', 'Medicine'];
const statuses = ['Available', 'In Use', 'Maintenance', 'Out of Order'];
const items = [
  { name: 'Ventilator', category: 'Equipment', isVentilator: true },
  { name: 'Hospital Bed', category: 'Equipment', isVentilator: false },
  { name: 'Surgical Mask', category: 'PPE', isVentilator: false },
  { name: 'N95 Mask', category: 'PPE', isVentilator: false },
  { name: 'Gloves', category: 'PPE', isVentilator: false },
  { name: 'Face Shield', category: 'PPE', isVentilator: false },
  { name: 'Gown', category: 'PPE', isVentilator: false },
  { name: 'Sanitizer', category: 'Supplies', isVentilator: false },
  { name: 'Syringe', category: 'Supplies', isVentilator: false },
  { name: 'Bandage', category: 'Supplies', isVentilator: false },
  { name: 'IV Set', category: 'Supplies', isVentilator: false },
  { name: 'Oxygen Tank', category: 'Equipment', isVentilator: false },
  { name: 'Wheelchair', category: 'Equipment', isVentilator: false },
  { name: 'Blood Pressure Monitor', category: 'Equipment', isVentilator: false },
  { name: 'Thermometer', category: 'Equipment', isVentilator: false },
  { name: 'Defibrillator', category: 'Equipment', isVentilator: false },
  { name: 'ECG Machine', category: 'Equipment', isVentilator: false },
  { name: 'Patient Monitor', category: 'Equipment', isVentilator: false },
  { name: 'Surgical Tools', category: 'Equipment', isVentilator: false }
];

async function generateInventoryData() {
  try {
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory data');

    const hospitalUsage = {};
    hospitalData.forEach(hospital => {
      hospitalUsage[hospital.name] = {
        total: 0,
        ventilators: 0,
        capacity: hospital.capacity,
        ventilatorCapacity: hospital.ventilatorCapacity
      };
    });

    const inventoryItems = [];
    let attempts = 0;
    const maxAttempts = 15000; 

    while (inventoryItems.length < 5200 && attempts < maxAttempts) {
      attempts++;
      const hospital = hospitalData[Math.floor(Math.random() * hospitalData.length)];
      const item = items[Math.floor(Math.random() * items.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const usage = hospitalUsage[hospital.name];
      let quantity;

      if (item.isVentilator) {
        if (usage.ventilators >= hospital.ventilatorCapacity) {
          continue;
        }
        
        const remainingVentCapacity = hospital.ventilatorCapacity - usage.ventilators;
        quantity = Math.min(
          Math.floor(Math.random() * 3) + 1, 
          remainingVentCapacity
        );
      } else {
        const remainingCapacity = hospital.capacity - usage.total;
        if (remainingCapacity <= 0) {
          continue;
        }

        quantity = Math.min(
          Math.floor(Math.random() * 10) + 1,
          remainingCapacity
        );
      }

      if (quantity <= 0) {
        continue;
      }

      if (item.isVentilator) {
        usage.ventilators += quantity;
      }
      usage.total += quantity;

      inventoryItems.push({
        name: `${item.name} #${Math.floor(Math.random() * 1000)}`,
        quantity,
        category: item.category,
        hospitalLocation: hospital.name,
        isVentilator: item.isVentilator,
        status,
        lastUpdated: new Date()
      });

      if (inventoryItems.length % 500 === 0) {
        console.log(`Generated ${inventoryItems.length} items...`);
      }
    }

    const batchSize = 100;
    for (let i = 0; i < inventoryItems.length; i += batchSize) {
      const batch = inventoryItems.slice(i, i + batchSize);
      await Inventory.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(inventoryItems.length/batchSize)}`);
    }

    const totalCount = await Inventory.countDocuments();
    console.log('\nFinal Statistics:');
    console.log(`Total records created: ${totalCount}`);
    
    console.log('\nHospital Capacity Utilization:');
    Object.entries(hospitalUsage).forEach(([name, usage]) => {
      const utilizationPercent = ((usage.total / usage.capacity) * 100).toFixed(1);
      const ventUtilizationPercent = ((usage.ventilators / usage.ventilatorCapacity) * 100).toFixed(1);
      console.log(`${name}:`);
      console.log(`  Total: ${utilizationPercent}% (${usage.total}/${usage.capacity})`);
      console.log(`  Ventilators: ${ventUtilizationPercent}% (${usage.ventilators}/${usage.ventilatorCapacity})`);
    });

    process.exit(0);

  } catch (error) {
    console.error('Error generating data:', error);
    process.exit(1);
  }
}
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return generateInventoryData();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

