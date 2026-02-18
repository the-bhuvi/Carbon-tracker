import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hynwnvyfsrmmitstgfui.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bndudnlmc3JtbWl0c3RnZnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3NTU1NzEsImV4cCI6MjA1MzMzMTU3MX0.fULF6k8vMjCYe17MxnaDkf4P-8fDXmDmPBd4OO7qwBc';

const supabase = createClient(supabaseUrl, supabaseKey);

const historicalData = [
  { month: '2024-07-01', electricity_kwh: 30416, diesel_liters: 600, petrol_liters: 525, lpg_kg: 133, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2024-08-01', electricity_kwh: 76038, diesel_liters: 1200, petrol_liters: 525, lpg_kg: 285, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2024-09-01', electricity_kwh: 82006, diesel_liters: 1200, petrol_liters: 525, lpg_kg: 285, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2024-10-01', electricity_kwh: 89221, diesel_liters: 400, petrol_liters: 525, lpg_kg: 285, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2024-11-01', electricity_kwh: 85703, diesel_liters: 600, petrol_liters: 525, lpg_kg: 228, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2024-12-01', electricity_kwh: 83948, diesel_liters: 300, petrol_liters: 525, lpg_kg: 247, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2025-01-01', electricity_kwh: 71298, diesel_liters: 400, petrol_liters: 525, lpg_kg: 190, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2025-02-01', electricity_kwh: 65174, diesel_liters: 400, petrol_liters: 525, lpg_kg: 285, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2025-03-01', electricity_kwh: 84851, diesel_liters: 400, petrol_liters: 525, lpg_kg: 285, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2025-04-01', electricity_kwh: 91594, diesel_liters: 400, petrol_liters: 525, lpg_kg: 228, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2025-05-01', electricity_kwh: 94464, diesel_liters: 300, petrol_liters: 525, lpg_kg: 247, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 },
  { month: '2025-06-01', electricity_kwh: 78637, diesel_liters: 400, petrol_liters: 175, lpg_kg: 133, travel_km: 40000, water_liters: 0, paper_kg: 0, plastic_kg: 0, ewaste_kg: 0, organic_waste_kg: 0 }
];

async function importData() {
  try {
    console.log('🚀 Starting data import...');

    // Get or create department
    let { data: dept, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('name', 'Institution-wide')
      .single();

    if (deptError || !dept) {
      console.log('📁 Creating Institution-wide department...');
      const { data: newDept, error: createDeptError } = await supabase
        .from('departments')
        .insert({ name: 'Institution-wide', student_count: 10000 })
        .select()
        .single();
      
      if (createDeptError) throw createDeptError;
      dept = newDept;
      console.log('✅ Department created:', dept.id);
    } else {
      console.log('✅ Using existing department:', dept.id);
    }

    // Get or create admin user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@institution.edu')
      .single();

    if (userError || !user) {
      console.log('👤 Creating admin user...');
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          name: 'System Admin',
          email: 'admin@institution.edu',
          role: 'admin',
          department_id: dept.id
        })
        .select()
        .single();
      
      if (createUserError) throw createUserError;
      user = newUser;
      console.log('✅ User created:', user.id);
    } else {
      console.log('✅ Using existing user:', user.id);
    }

    // Import historical data
    console.log('📊 Importing 12 months of historical data...');
    
    for (const record of historicalData) {
      const { error: insertError } = await supabase
        .from('carbon_submissions')
        .insert({
          user_id: user.id,
          department_id: dept.id,
          submission_date: record.month,
          electricity_kwh: record.electricity_kwh,
          diesel_liters: record.diesel_liters,
          petrol_liters: record.petrol_liters,
          lpg_kg: record.lpg_kg,
          travel_km: record.travel_km,
          water_liters: record.water_liters,
          paper_kg: record.paper_kg,
          plastic_kg: record.plastic_kg,
          ewaste_kg: record.ewaste_kg,
          organic_waste_kg: record.organic_waste_kg
        });

      if (insertError) {
        console.error(`❌ Error importing ${record.month}:`, insertError.message);
      } else {
        console.log(`✅ Imported ${record.month}`);
      }
    }

    console.log('🎉 Data import completed!');

  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

importData();
