const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Plant data with different moods
const plants = [
  {
    name: "Happy Sprouty",
    health: 90,
    happiness: 95,
    growth: 60,
    stage: "mature",
    mood: "happy",
    last_watered: new Date().toISOString(),
    last_fed: new Date().toISOString(),
    last_played: new Date().toISOString()
  },
  {
    name: "Sad Wilty",
    health: 30,
    happiness: 20,
    growth: 15,
    stage: "seedling",
    mood: "sad",
    last_watered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    last_fed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    last_played: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
  },
  {
    name: "Sleepy Drowsy",
    health: 70,
    happiness: 50,
    growth: 40,
    stage: "growing",
    mood: "sleepy",
    last_watered: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    last_fed: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    last_played: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    name: "Excited Bouncy",
    health: 85,
    happiness: 100,
    growth: 75,
    stage: "blooming",
    mood: "excited",
    last_watered: new Date().toISOString(),
    last_fed: new Date().toISOString(),
    last_played: new Date().toISOString()
  },
  {
    name: "Grumpy Thorn",
    health: 45,
    happiness: 35,
    growth: 25,
    stage: "seedling",
    mood: "sad",
    last_watered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    last_fed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    last_played: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    name: "Zen Master",
    health: 80,
    happiness: 70,
    growth: 50,
    stage: "mature",
    mood: "sleepy",
    last_watered: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    last_fed: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    last_played: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
  },
  {
    name: "Party Plant",
    health: 95,
    happiness: 100,
    growth: 80,
    stage: "blooming",
    mood: "excited",
    last_watered: new Date().toISOString(),
    last_fed: new Date().toISOString(),
    last_played: new Date().toISOString()
  },
  {
    name: "Content Bloom",
    health: 75,
    happiness: 80,
    growth: 55,
    stage: "growing",
    mood: "happy",
    last_watered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    last_fed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    last_played: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  }
]

async function populatePlants() {
  try {
    console.log('🌱 Starting to populate database with plants...')
    
    // Get the current user (you'll need to be authenticated)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ No authenticated user found. Please sign in first.')
      return
    }
    
    console.log(`👤 Creating plants for user: ${user.email}`)
    
    // Create each plant
    for (const plantData of plants) {
      console.log(`🌿 Creating plant: ${plantData.name} (${plantData.mood})`)
      
      const { data: plant, error: plantError } = await supabase
        .from('plants')
        .insert({
          ...plantData,
          owner_id: user.id
        })
        .select()
        .single()
      
      if (plantError) {
        console.error(`❌ Error creating plant ${plantData.name}:`, plantError)
        continue
      }
      
      console.log(`✅ Created plant: ${plant.name} (ID: ${plant.id})`)
      
      // Add owner as a member
      const { error: memberError } = await supabase
        .from('plant_members')
        .insert({
          plant_id: plant.id,
          user_id: user.id,
          role: 'owner'
        })
      
      if (memberError) {
        console.error(`⚠️ Error adding owner as member for ${plant.name}:`, memberError)
      }
    }
    
    console.log('🎉 Successfully populated database with plants!')
    console.log('\n📊 Plant Summary:')
    console.log(`- Happy plants: ${plants.filter(p => p.mood === 'happy').length}`)
    console.log(`- Sad plants: ${plants.filter(p => p.mood === 'sad').length}`)
    console.log(`- Sleepy plants: ${plants.filter(p => p.mood === 'sleepy').length}`)
    console.log(`- Excited plants: ${plants.filter(p => p.mood === 'excited').length}`)
    
  } catch (error) {
    console.error('❌ Error populating plants:', error)
  }
}

// Run the script
populatePlants()
