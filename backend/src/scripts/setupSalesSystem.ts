import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SalesLead from '../models/SalesLead';

dotenv.config();

// Sample leads for testing
const sampleLeads = [
  {
    companyName: 'TechCorp Solutions',
    contactPerson: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0101',
    industry: 'Technology',
    companySize: '201-500',
    source: 'linkedin',
    budget: 75000,
    status: 'new',
    priority: 'high',
    notes: 'Interested in Q1 advertising campaign. Budget approved.'
  },
  {
    companyName: 'Global Retail Inc',
    contactPerson: 'Michael Chen',
    email: 'mchen@globalretail.com',
    phone: '+1-555-0102',
    industry: 'Retail',
    companySize: '1000+',
    source: 'referral',
    budget: 150000,
    status: 'contacted',
    priority: 'urgent',
    notes: 'Large retail chain. Looking for multi-channel campaign.'
  },
  {
    companyName: 'StartupXYZ',
    contactPerson: 'Emily Rodriguez',
    email: 'emily@startupxyz.com',
    phone: '+1-555-0103',
    industry: 'SaaS',
    companySize: '11-50',
    source: 'website',
    budget: 25000,
    status: 'qualified',
    priority: 'medium',
    notes: 'Early stage startup. Interested in digital advertising.'
  },
  {
    companyName: 'Healthcare Plus',
    contactPerson: 'Dr. James Wilson',
    email: 'jwilson@healthcareplus.com',
    phone: '+1-555-0104',
    industry: 'Healthcare',
    companySize: '51-200',
    source: 'cold_call',
    budget: 50000,
    status: 'proposal_sent',
    priority: 'high',
    notes: 'Proposal sent on Monday. Follow up scheduled for Friday.'
  },
  {
    companyName: 'Finance Group LLC',
    contactPerson: 'Amanda Thompson',
    email: 'athompson@financegroup.com',
    phone: '+1-555-0105',
    industry: 'Finance',
    companySize: '501-1000',
    source: 'inbound',
    budget: 100000,
    status: 'negotiation',
    priority: 'urgent',
    notes: 'In final negotiations. Decision expected next week.'
  }
];

async function setupSalesSystem() {
  try {
    console.log('🚀 Setting up Sales Automation System...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/referus');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing leads (optional - comment out if you want to keep existing data)
    // await SalesLead.deleteMany({});
    // console.log('🗑️  Cleared existing leads\n');

    // Create sample leads
    console.log('📝 Creating sample leads...');
    for (const leadData of sampleLeads) {
      const lead = new SalesLead(leadData);
      lead.aiScore = Math.floor(Math.random() * 40) + 60; // Random score 60-100
      await lead.save();
      console.log(`   ✓ Created: ${lead.companyName} (${lead.contactPerson})`);
    }

    console.log('\n✅ Sample leads created successfully!\n');

    // Display summary
    const stats = {
      total: await SalesLead.countDocuments(),
      new: await SalesLead.countDocuments({ status: 'new' }),
      contacted: await SalesLead.countDocuments({ status: 'contacted' }),
      qualified: await SalesLead.countDocuments({ status: 'qualified' }),
      proposal_sent: await SalesLead.countDocuments({ status: 'proposal_sent' }),
      negotiation: await SalesLead.countDocuments({ status: 'negotiation' })
    };

    console.log('📊 Current Statistics:');
    console.log(`   Total Leads: ${stats.total}`);
    console.log(`   New: ${stats.new}`);
    console.log(`   Contacted: ${stats.contacted}`);
    console.log(`   Qualified: ${stats.qualified}`);
    console.log(`   Proposal Sent: ${stats.proposal_sent}`);
    console.log(`   Negotiation: ${stats.negotiation}`);

    console.log('\n🎉 Setup complete!\n');
    console.log('📍 Next steps:');
    console.log('   1. Configure .env with OPENAI_API_KEY and SMTP settings');
    console.log('   2. Start the server: npm run dev');
    console.log('   3. Access dashboard: http://localhost:5173/admin/sales');
    console.log('   4. Review documentation: SALES_AUTOMATION_SYSTEM.md\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupSalesSystem();
