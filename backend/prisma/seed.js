const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const menuItems = [
  // South Indian
  {
    name: 'Masala Dosa',
    description: 'Crispy rice and lentil crepe filled with spiced potato curry, served with sambar and chutney',
    price: 60,
    category: 'South Indian',
    imageUrl: 'https://images.pexels.com/photos/12392915/pexels-photo-12392915.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Plain Dosa',
    description: 'Classic crispy rice and lentil crepe served with sambar and chutney',
    price: 40,
    category: 'South Indian',
    imageUrl: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Rava Idli',
    description: 'Soft and fluffy idli made from semolina, served with sambar and chutney',
    price: 50,
    category: 'South Indian',
    imageUrl: 'https://images.pexels.com/photos/4331491/pexels-photo-4331491.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Medu Vada',
    description: 'Crispy deep-fried lentil donuts, served with sambar',
    price: 30,
    category: 'South Indian',
    imageUrl: 'https://images.pexels.com/photos/8312083/pexels-photo-8312083.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Masala Idli',
    description: 'Idli sautéed with spices, onions, and tomatoes',
    price: 55,
    category: 'South Indian',
    imageUrl: 'https://images.pexels.com/photos/4331488/pexels-photo-4331488.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Set Dosa',
    description: 'Soft and spongy dosa served with curry and chutney',
    price: 45,
    category: 'South Indian',
    imageUrl: 'https://images.pexels.com/photos/28107046/pexels-photo-28107046.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Snacks
  {
    name: 'Veg Sandwich',
    description: 'Toasted bread filled with fresh vegetables and tangy chutney',
    price: 40,
    category: 'Snacks',
    imageUrl: 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Cheese Sandwich',
    description: 'Toasted sandwich loaded with melted cheese and vegetables',
    price: 50,
    category: 'Snacks',
    imageUrl: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Poha',
    description: 'Flattened rice cooked with peanuts, onions, and spices',
    price: 35,
    category: 'Snacks',
    imageUrl: 'https://images.pexels.com/photos/30769669/pexels-photo-30769669.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Jalebi',
    description: 'Crispy, juicy Indian sweet soaked in sugar syrup',
    price: 25,
    category: 'Snacks',
    imageUrl: 'https://images.pexels.com/photos/36215924/pexels-photo-36215924.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Bread Pakora',
    description: 'Crispy bread fritters stuffed with spiced potato',
    price: 35,
    category: 'Snacks',
    imageUrl: 'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Maggi',
    description: 'Instant noodles cooked with vegetables and masala',
    price: 30,
    category: 'Snacks',
    imageUrl: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Samosa',
    description: 'Crispy pastry filled with spiced potatoes and peas',
    price: 20,
    category: 'Snacks',
    imageUrl: 'https://images.pexels.com/photos/9027521/pexels-photo-9027521.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Beverages
  {
    name: 'Tea',
    description: 'Indian spiced tea with milk',
    price: 15,
    category: 'Beverages',
    imageUrl: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Coffee',
    description: 'Rich and creamy Indian filter coffee',
    price: 25,
    category: 'Beverages',
    imageUrl: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Cold Coffee',
    description: 'Refreshing iced coffee with cream',
    price: 40,
    category: 'Beverages',
    imageUrl: 'https://images.pexels.com/photos/2638019/pexels-photo-2638019.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Mango Shake',
    description: 'Thick and creamy mango milkshake',
    price: 50,
    category: 'Beverages',
    imageUrl: 'https://images.pexels.com/photos/2103949/pexels-photo-2103949.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Buttermilk',
    description: 'Refreshing spiced buttermilk',
    price: 20,
    category: 'Beverages',
    imageUrl: 'https://images.pexels.com/photos/1435706/pexels-photo-1435706.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Banana Shake',
    description: 'Creamy banana milkshake',
    price: 40,
    category: 'Beverages',
    imageUrl: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Badam Milk',
    description: 'Almond milk with cardamom flavor',
    price: 35,
    category: 'Beverages',
    imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Lemon Tea',
    description: 'Refreshing tea with lemon',
    price: 20,
    category: 'Beverages',
    imageUrl: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Rice Items
  {
    name: 'Veg Fried Rice',
    description: 'Wok-tossed rice with mixed vegetables and soy sauce',
    price: 80,
    category: 'Rice Items',
    imageUrl: 'https://images.pexels.com/photos/6937455/pexels-photo-6937455.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Chicken Fried Rice',
    description: 'Wok-tossed rice with chicken and vegetables',
    price: 120,
    category: 'Rice Items',
    imageUrl: 'https://images.pexels.com/photos/6937454/pexels-photo-6937454.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Jeera Rice',
    description: 'Basmati rice tempered with cumin seeds',
    price: 60,
    category: 'Rice Items',
    imageUrl: 'https://images.pexels.com/photos/34159107/pexels-photo-34159107.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Dal Khichdi',
    description: 'Comforting dish of rice and lentils tempered with ghee',
    price: 70,
    category: 'Rice Items',
    imageUrl: 'https://images.pexels.com/photos/4439740/pexels-photo-4439740.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice with spiced vegetables',
    price: 90,
    category: 'Rice Items',
    imageUrl: 'https://images.pexels.com/photos/5410401/pexels-photo-5410401.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice with tender chicken pieces',
    price: 150,
    category: 'Rice Items',
    imageUrl: 'https://images.pexels.com/photos/33947401/pexels-photo-33947401.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },

  // Others
  {
    name: 'Pav Bhaji',
    description: 'Spiced mashed vegetables served with buttered bread',
    price: 60,
    category: 'Others',
    imageUrl: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Chole Bhature',
    description: 'Spiced chickpeas served with fluffy bread',
    price: 70,
    category: 'Others',
    imageUrl: 'https://images.pexels.com/photos/7625089/pexels-photo-7625089.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Aloo Paratha',
    description: 'Flatbread stuffed with spiced potato, served with curd',
    price: 45,
    category: 'Others',
    imageUrl: 'https://images.pexels.com/photos/10675801/pexels-photo-10675801.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Paneer Paratha',
    description: 'Flatbread stuffed with cottage cheese',
    price: 55,
    category: 'Others',
    imageUrl: 'https://images.pexels.com/photos/11287586/pexels-photo-11287586.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Vegetable Cutlet',
    description: 'Crispy croquette made with mixed vegetables',
    price: 40,
    category: 'Others',
    imageUrl: 'https://images.pexels.com/photos/15144956/pexels-photo-15144956.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries with salt',
    price: 45,
    category: 'Others',
    imageUrl: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Spring Roll',
    description: 'Crispy rolls filled with vegetables',
    price: 50,
    category: 'Others',
    imageUrl: 'https://images.pexels.com/photos/36170557/pexels-photo-36170557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  },
  {
    name: 'Manchurian',
    description: 'Fried vegetable balls in spicy Manchurian sauce',
    price: 70,
    category: 'Others',
    imageUrl: 'https://images.pexels.com/photos/17661072/pexels-photo-17661072.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  }
];

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@prebite.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@prebite.com',
      passwordHash: adminPassword,
      role: 'admin'
    }
  });
  console.log('Admin created:', admin.email);

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@prebite.com' },
    update: {},
    create: {
      name: 'Student',
      email: 'student@prebite.com',
      passwordHash: studentPassword,
      role: 'student'
    }
  });
  console.log('Student created:', student.email);

  // Create menu items
  await prisma.menuItem.deleteMany();
  console.log('Cleared existing menu items');

  await prisma.menuItem.createMany({
    data: menuItems
  });
  console.log(`Created ${menuItems.length} menu items`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

