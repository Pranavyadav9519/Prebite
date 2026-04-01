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
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop'
  },
  {
    name: 'Plain Dosa',
    description: 'Classic crispy rice and lentil crepe served with sambar and chutney',
    price: 40,
    category: 'South Indian',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop'
  },
  {
    name: 'Rava Idli',
    description: 'Soft and fluffy idli made from semolina, served with sambar and chutney',
    price: 50,
    category: 'South Indian',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop'
  },
  {
    name: 'Medu Vada',
    description: 'Crispy deep-fried lentil donuts, served with sambar',
    price: 30,
    category: 'South Indian',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop'
  },
  {
    name: 'Masala Idli',
    description: 'Idli sautéed with spices, onions, and tomatoes',
    price: 55,
    category: 'South Indian',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop'
  },
  {
    name: 'Set Dosa',
    description: 'Soft and spongy dosa served with curry and chutney',
    price: 45,
    category: 'South Indian',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop'
  },

  // Snacks
  {
    name: 'Veg Sandwich',
    description: 'Toasted bread filled with fresh vegetables and tangy chutney',
    price: 40,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop'
  },
  {
    name: 'Cheese Sandwich',
    description: 'Toasted sandwich loaded with melted cheese and vegetables',
    price: 50,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop'
  },
  {
    name: 'Poha',
    description: 'Flattened rice cooked with peanuts, onions, and spices',
    price: 35,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1630409351217-bc4fa6422075?w=400&h=300&fit=crop'
  },
  {
    name: 'Jalebi',
    description: 'Crispy, juicy Indian sweet soaked in sugar syrup',
    price: 25,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&h=300&fit=crop'
  },
  {
    name: 'Bread Pakora',
    description: 'Crispy bread fritters stuffed with spiced potato',
    price: 35,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop'
  },
  {
    name: 'Maggi',
    description: 'Instant noodles cooked with vegetables and masala',
    price: 30,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop'
  },
  {
    name: 'Samosa',
    description: 'Crispy pastry filled with spiced potatoes and peas',
    price: 20,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop'
  },

  // Beverages
  {
    name: 'Tea',
    description: 'Indian spiced tea with milk',
    price: 15,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop'
  },
  {
    name: 'Coffee',
    description: 'Rich and creamy Indian filter coffee',
    price: 25,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?w=400&h=300&fit=crop'
  },
  {
    name: 'Cold Coffee',
    description: 'Refreshing iced coffee with cream',
    price: 40,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
  },
  {
    name: 'Mango Shake',
    description: 'Thick and creamy mango milkshake',
    price: 50,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop'
  },
  {
    name: 'Buttermilk',
    description: 'Refreshing spiced buttermilk',
    price: 20,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1627454626626-d295110b6d33?w=400&h=300&fit=crop'
  },
  {
    name: 'Banana Shake',
    description: 'Creamy banana milkshake',
    price: 40,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop'
  },
  {
    name: 'Badam Milk',
    description: 'Almond milk with cardamom flavor',
    price: 35,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop'
  },
  {
    name: 'Lemon Tea',
    description: 'Refreshing tea with lemon',
    price: 20,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop'
  },

  // Rice Items
  {
    name: 'Veg Fried Rice',
    description: 'Wok-tossed rice with mixed vegetables and soy sauce',
    price: 80,
    category: 'Rice Items',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop'
  },
  {
    name: 'Chicken Fried Rice',
    description: 'Wok-tossed rice with chicken and vegetables',
    price: 120,
    category: 'Rice Items',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop'
  },
  {
    name: 'Jeera Rice',
    description: 'Basmati rice tempered with cumin seeds',
    price: 60,
    category: 'Rice Items',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop'
  },
  {
    name: 'Dal Khichdi',
    description: 'Comforting dish of rice and lentils tempered with ghee',
    price: 70,
    category: 'Rice Items',
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400&h=300&fit=crop'
  },
  {
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice with spiced vegetables',
    price: 90,
    category: 'Rice Items',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop'
  },
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice with tender chicken pieces',
    price: 150,
    category: 'Rice Items',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop'
  },

  // Others
  {
    name: 'Pav Bhaji',
    description: 'Spiced mashed vegetables served with buttered bread',
    price: 60,
    category: 'Others',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop'
  },
  {
    name: 'Chole Bhature',
    description: 'Spiced chickpeas served with fluffy bread',
    price: 70,
    category: 'Others',
    imageUrl: 'https://images.unsplash.com/photo-1626132647523-66dbeac34534?w=400&h=300&fit=crop'
  },
  {
    name: 'Aloo Paratha',
    description: 'Flatbread stuffed with spiced potato, served with curd',
    price: 45,
    category: 'Others',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'
  },
  {
    name: 'Paneer Paratha',
    description: 'Flatbread stuffed with cottage cheese',
    price: 55,
    category: 'Others',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop'
  },
  {
    name: 'Vegetable Cutlet',
    description: 'Crispy croquette made with mixed vegetables',
    price: 40,
    category: 'Others',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop'
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries with salt',
    price: 45,
    category: 'Others',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop'
  },
  {
    name: 'Spring Roll',
    description: 'Crispy rolls filled with vegetables',
    price: 50,
    category: 'Others',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop'
  },
  {
    name: 'Manchurian',
    description: 'Fried vegetable balls in spicy Manchurian sauce',
    price: 70,
    category: 'Others',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop'
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
  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.name.toLowerCase().replace(/\s+/g, '-') },
      update: item,
      create: item
    });
  }
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

