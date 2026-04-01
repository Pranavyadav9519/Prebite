const prisma = require('../config/db');
const apiResponse = require('../utils/apiResponse');

// Get all menu items (public)
const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, available } = req.query;

    const where = {};

    // Filter by category
    if (category && category !== 'All') {
      where.category = category;
    }

    // Filter by availability
    if (available === 'true') {
      where.isAvailable = true;
    }

    // Search by name
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return apiResponse.ok(res, { menuItems });
  } catch (error) {
    next(error);
  }
};

// Get single menu item
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!menuItem) {
      return apiResponse.notFound(res, 'Menu item not found');
    }

    return apiResponse.ok(res, { menuItem });
  } catch (error) {
    next(error);
  }
};

// Create menu item (admin only)
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    // Validate input
    if (!name || !price || !category) {
      return apiResponse.badRequest(res, 'Please provide name, price and category');
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
        isAvailable: isAvailable !== false
      }
    });

    return apiResponse.created(res, { menuItem }, 'Menu item created successfully');
  } catch (error) {
    next(error);
  }
};

// Update menu item (admin only)
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return apiResponse.notFound(res, 'Menu item not found');
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isAvailable !== undefined && { isAvailable })
      }
    });

    return apiResponse.ok(res, { menuItem }, 'Menu item updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete menu item (admin only)
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if menu item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return apiResponse.notFound(res, 'Menu item not found');
    }

    await prisma.menuItem.delete({
      where: { id }
    });

    return apiResponse.ok(res, {}, 'Menu item deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get menu categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.menuItem.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories.map(c => c.category);
    
    return apiResponse.ok(res, { categories: ['All', ...categoryList] });
  } catch (error) {
    next(error);
  }
};

// Seed initial menu items (admin only - for development)
const seedMenuItems = async (req, res, next) => {
  try {
    const menuItems = [
      // South Indian
      { name: 'Masala Dosa', description: 'Crispy rice and lentil crepe filled with spiced potato filling', price: 60, category: 'South Indian', imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400' },
      { name: 'Plain Dosa', description: 'Crispy rice and lentil crepe', price: 40, category: 'South Indian', imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400' },
      { name: 'Rava Idli', description: 'Soft semolina idlis served with sambar and chutney', price: 50, category: 'South Indian', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400' },
      { name: 'Medu Vada', description: 'Crispy lentil donuts served with sambar', price: 30, category: 'South Indian', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400' },
      { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil stew', price: 45, category: 'South Indian', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400' },
      
      // Snacks
      { name: 'Veg Sandwich', description: 'Toast bread with vegetables and chutney', price: 40, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
      { name: 'Cheese Sandwich', description: 'Grilled sandwich with melted cheese', price: 50, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
      { name: 'Poha', description: 'Flattened rice with peanuts and vegetables', price: 35, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1630409351217-bc4fa6422075?w=400' },
      { name: 'Jalebi', description: 'Crispy sweet spirals soaked in syrup', price: 25, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1666190053408-602f1f3e98d5?w=400' },
      { name: 'Maggi', description: 'Instant noodles with vegetables', price: 30, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400' },
      { name: 'Bread Pakora', description: 'Bread slicesgram flour batter and deep fried', price: 35, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
      { name: 'Samosa', description: 'Crispy pastry with spiced potato filling', price: 20, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
      
      // Beverages
      { name: 'Tea', description: 'Traditional Indian masala tea', price: 15, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400' },
      { name: 'Coffee', description: 'Hot filter coffee', price: 25, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400' },
      { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 40, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
      { name: 'Mango Shake', description: 'Fresh mango milkshake', price: 50, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400' },
      { name: 'Buttermilk', description: 'Spiced salted buttermilk', price: 20, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400' },
      { name: 'Orange Juice', description: 'Fresh orange juice', price: 35, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
      { name: 'Badam Milk', description: 'Almond milk with cardamom', price: 40, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400' },
      
      // Rice Items
      { name: 'Veg Fried Rice', description: 'Fried rice with mixed vegetables', price: 80, category: 'Rice', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
      { name: 'Chicken Fried Rice', description: 'Fried rice with chicken pieces', price: 120, category: 'Rice', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
      { name: 'Jeera Rice', description: 'Basmati rice with cumin seeds', price: 60, category: 'Rice', imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400' },
      { name: 'Dal Khichdi', description: 'Lentils and rice mixed', price: 70, category: 'Rice', imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=400' },
      { name: 'Lemon Rice', description: 'Rice with lemon and peanuts', price: 55, category: 'Rice', imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400' },
      
      // Others
      { name: 'Pav Bhaji', description: 'Spiced vegetable mash with buttered bread', price: 60, category: 'Others', imageUrl: 'https://images.unsplash.com/photo-1626132647523-66dbeac34534?w=400' },
      { name: 'Chole Bhature', description: 'Chickpea curry with fried bread', price: 70, category: 'Others', imageUrl: 'https://images.unsplash.com/photo-1626132647523-66dbeac34534?w=400' },
      { name: 'Raj Kachori', description: 'Crispy kachori with various chutneys', price: 55, category: 'Others', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
      { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 90, category: 'Others', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
      { name: 'Veg Biryani', description: 'Aromatic rice with vegetables', price: 100, category: 'Others', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
      { name: 'Chicken Biryani', description: 'Aromatic rice with chicken', price: 150, category: 'Others', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
    ];

    // Check if menu items already exist
    const existingCount = await prisma.menuItem.count();
    
    if (existingCount > 0) {
      return apiResponse.ok(res, { message: 'Menu items already seeded', count: existingCount });
    }

    // Create all menu items
    const createdItems = await prisma.menuItem.createMany({
      data: menuItems
    });

    return apiResponse.created(res, { 
      count: createdItems.count 
    }, 'Menu items seeded successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  seedMenuItems
};

