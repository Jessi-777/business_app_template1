import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Affiliate from '../models/Affiliate.js';

dotenv.config();

const seedAffiliates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing affiliates
    await Affiliate.deleteMany({});
    console.log('Cleared existing affiliates');

    // Sample affiliates with realistic data
    const affiliates = [
      {
        name: 'Sarah Martinez',
        email: 'sarah.martinez@email.com',
        code: 'SARAH10',
        tier: 'Gold',
        commissionRate: 15,
        status: 'active',
        totalSales: 68,
        totalRevenue: 2720,
        totalCommission: 408,
        unpaidCommission: 180,
        clicks: 1240,
        conversions: 68,
        paymentInfo: {
          method: 'paypal',
          details: 'sarah.martinez@paypal.com'
        }
      },
      {
        name: 'James Chen',
        email: 'james.chen@email.com',
        code: 'JAMESFIT',
        tier: 'Silver',
        commissionRate: 12,
        status: 'active',
        totalSales: 34,
        totalRevenue: 1496,
        totalCommission: 179.52,
        unpaidCommission: 120,
        clicks: 890,
        conversions: 34,
        paymentInfo: {
          method: 'paypal',
          details: 'jchen@paypal.com'
        }
      },
      {
        name: 'Emily Johnson',
        email: 'emily.j@email.com',
        code: 'EMILY15',
        tier: 'Bronze',
        commissionRate: 10,
        status: 'active',
        totalSales: 18,
        totalRevenue: 792,
        totalCommission: 79.2,
        unpaidCommission: 79.2,
        clicks: 520,
        conversions: 18,
        paymentInfo: {
          method: 'venmo',
          details: '@emily-johnson'
        }
      },
      {
        name: 'Michael Rodriguez',
        email: 'mrodriguez@email.com',
        code: 'MIKE20',
        tier: 'Platinum',
        commissionRate: 20,
        status: 'active',
        totalSales: 142,
        totalRevenue: 6248,
        totalCommission: 1249.6,
        unpaidCommission: 420,
        clicks: 2850,
        conversions: 142,
        paymentInfo: {
          method: 'bank',
          details: 'Bank account ending in 4521'
        }
      },
      {
        name: 'Jessica Williams',
        email: 'jwilliams@email.com',
        code: 'JESS10',
        tier: 'Silver',
        commissionRate: 12,
        status: 'active',
        totalSales: 29,
        totalRevenue: 1247,
        totalCommission: 149.64,
        unpaidCommission: 85,
        clicks: 680,
        conversions: 29
      },
      {
        name: 'David Park',
        email: 'dpark@email.com',
        code: 'DAVID25',
        tier: 'Gold',
        commissionRate: 15,
        status: 'active',
        totalSales: 51,
        totalRevenue: 2193,
        totalCommission: 328.95,
        unpaidCommission: 215,
        clicks: 1120,
        conversions: 51
      },
      {
        name: 'Amanda Foster',
        email: 'afoster@email.com',
        code: 'AMANDA',
        tier: 'Bronze',
        commissionRate: 10,
        status: 'active',
        totalSales: 12,
        totalRevenue: 528,
        totalCommission: 52.8,
        unpaidCommission: 52.8,
        clicks: 340,
        conversions: 12
      },
      {
        name: 'Chris Thompson',
        email: 'cthompson@email.com',
        code: 'CHRIS30',
        tier: 'Bronze',
        commissionRate: 10,
        status: 'pending',
        totalSales: 3,
        totalRevenue: 117,
        totalCommission: 11.7,
        unpaidCommission: 11.7,
        clicks: 95,
        conversions: 3
      }
    ];

    await Affiliate.insertMany(affiliates);
    console.log(`✅ Successfully seeded ${affiliates.length} affiliates!`);
    
    // Display summary
    const stats = {
      totalAffiliates: affiliates.length,
      totalRevenue: affiliates.reduce((sum, a) => sum + a.totalRevenue, 0),
      totalCommission: affiliates.reduce((sum, a) => sum + a.totalCommission, 0),
      unpaidCommission: affiliates.reduce((sum, a) => sum + a.unpaidCommission, 0)
    };
    
    console.log('\n📊 Affiliate Stats:');
    console.log(`Total Affiliates: ${stats.totalAffiliates}`);
    console.log(`Total Revenue: $${stats.totalRevenue.toLocaleString()}`);
    console.log(`Total Commission: $${stats.totalCommission.toFixed(2)}`);
    console.log(`Unpaid Commission: $${stats.unpaidCommission.toFixed(2)}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding affiliates:', error);
    process.exit(1);
  }
};

seedAffiliates();
