// Script to populate database with plants of different moods via API
// Run this in the browser console while logged in

const plants = [
  {
    name: "Happy Sprouty",
    health: 90,
    happiness: 95,
    growth: 60,
    stage: "mature",
    mood: "happy"
  },
  {
    name: "Sad Wilty",
    health: 30,
    happiness: 20,
    growth: 15,
    stage: "seedling",
    mood: "sad"
  },
  {
    name: "Sleepy Drowsy",
    health: 70,
    happiness: 50,
    growth: 40,
    stage: "growing",
    mood: "sleepy"
  },
  {
    name: "Excited Bouncy",
    health: 85,
    happiness: 100,
    growth: 75,
    stage: "blooming",
    mood: "excited"
  },
  {
    name: "Grumpy Thorn",
    health: 45,
    happiness: 35,
    growth: 25,
    stage: "seedling",
    mood: "sad"
  },
  {
    name: "Zen Master",
    health: 80,
    happiness: 70,
    growth: 50,
    stage: "mature",
    mood: "sleepy"
  },
  {
    name: "Party Plant",
    health: 95,
    happiness: 100,
    growth: 80,
    stage: "blooming",
    mood: "excited"
  },
  {
    name: "Content Bloom",
    health: 75,
    happiness: 80,
    growth: 55,
    stage: "growing",
    mood: "happy"
  }
]

async function populatePlants() {
  console.log('🌱 Starting to populate database with plants...')
  
  for (const plantData of plants) {
    try {
      console.log(`🌿 Creating plant: ${plantData.name} (${plantData.mood})`)
      
      const response = await fetch('/api/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: plantData.name })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      const plant = result.plant
      
      console.log(`✅ Created plant: ${plant.name} (ID: ${plant.id})`)
      
      // Update the plant with the specific mood and stats
      const updateResponse = await fetch(`/api/plants/${plant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          health: plantData.health,
          happiness: plantData.happiness,
          growth: plantData.growth,
          stage: plantData.stage,
          mood: plantData.mood
        })
      })
      
      if (updateResponse.ok) {
        console.log(`🎨 Updated ${plant.name} with ${plantData.mood} mood and stats`)
      } else {
        console.error(`❌ Failed to update ${plant.name}`)
      }
      
    } catch (error) {
      console.error(`❌ Error creating plant ${plantData.name}:`, error)
    }
  }
  
  console.log('🎉 Finished populating database!')
  console.log('\n📊 Plant Summary:')
  console.log(`- Happy plants: ${plants.filter(p => p.mood === 'happy').length}`)
  console.log(`- Sad plants: ${plants.filter(p => p.mood === 'sad').length}`)
  console.log(`- Sleepy plants: ${plants.filter(p => p.mood === 'sleepy').length}`)
  console.log(`- Excited plants: ${plants.filter(p => p.mood === 'excited').length}`)
}

// Instructions for the user
console.log(`
🌱 PLANT POPULATION SCRIPT
==========================

To populate your database with plants of different moods:

1. Make sure you're logged in to your app
2. Open the browser console (F12)
3. Copy and paste this entire script
4. Run: populatePlants()

This will create 8 plants with different moods:
- 2 Happy plants (green color)
- 2 Sad plants (gray color) 
- 2 Sleepy plants (purple color)
- 2 Excited plants (orange color)

Each plant will have different health, happiness, growth, and stage values
that match their mood and create a realistic variety.
`)

// Export the function for use
window.populatePlants = populatePlants
