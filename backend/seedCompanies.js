/**
 * Seed Script: Insert 3 pre-verified mock companies into MongoDB
 * Usage: node seedCompanies.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MOCK_COMPANIES = [
  {
    role: 'company',
    email: 'google@talentsync.dev',
    password: 'Company@123',
    companyName: 'Google India',
    govRegId: 'REG-GIN-20230101',
    gstCin: 'U72900KA2004PTC034130',
    verifiedStatus: 'verified',
  },
  {
    role: 'company',
    email: 'infosys@talentsync.dev',
    password: 'Company@123',
    companyName: 'Infosys Ltd',
    govRegId: 'REG-INF-19930101',
    gstCin: 'L85110KA1981PLC013115',
    verifiedStatus: 'verified',
  },
  {
    role: 'company',
    email: 'zomato@talentsync.dev',
    password: 'Company@123',
    companyName: 'Zomato Tech',
    govRegId: 'REG-ZOM-20100101',
    gstCin: 'U74899DL2010PTC198674',
    verifiedStatus: 'verified',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const company of MOCK_COMPANIES) {
      const exists = await User.findOne({ email: company.email });
      if (exists) {
        console.log(`⚠️  Already exists: ${company.companyName}`);
        continue;
      }
      const hashedPassword = await bcrypt.hash(company.password, 10);
      await User.create({ ...company, password: hashedPassword });
      console.log(`✅ Created: ${company.companyName} (${company.email})`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log('Login credentials for all companies: Company@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
    process.exit(1);
  }
}

seed();
