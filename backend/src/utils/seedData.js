import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { ProjectVersion } from '../models/Version.js';
import { getDomainFallbackBlueprint } from '../services/aiService.js';

export const seedInitialData = async () => {
  try {
    // 1. Ensure default Admin user
    let admin = await User.findOne({ email: 'admin@vision2system.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Lead Architect (Admin)',
        email: 'admin@vision2system.com',
        password: 'password123',
        role: 'admin',
        plan: 'enterprise',
        credits: 999
      });
      console.log('[Seeder] Created default Admin user: admin@vision2system.com / password123');
    }

    // 2. Ensure default standard Demo user
    let demoUser = await User.findOne({ email: 'user@vision2system.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Johnson (Demo)',
        email: 'user@vision2system.com',
        password: 'password123',
        role: 'user',
        plan: 'pro',
        credits: 100
      });
      console.log('[Seeder] Created default Demo user: user@vision2system.com / password123');
    }

    // 3. Ensure default Demo Projects
    const existingDemo = await Project.findOne({ isDemo: true, name: 'Food Delivery Platform' });
    if (!existingDemo) {
      const foodProjectData = {
        name: 'Food Delivery Platform',
        description: 'Build a food delivery application where customers can order food from restaurants, restaurants can manage menus, delivery partners can accept orders, and admins can manage the platform.',
        targetUsers: 'Customers, Restaurant Owners, Delivery Couriers, Platform Admins',
        expectedScale: 'High Scale (100k - 500k DAU)',
        preferredPlatform: 'Mobile & Cloud Native Microservices',
        preferredTech: ['React Native', 'Node.js', 'PostgreSQL', 'Redis', 'BullMQ', 'AWS ECS']
      };

      const foodBp = getDomainFallbackBlueprint(foodProjectData);

      const foodProject = await Project.create({
        ...foodProjectData,
        owner: admin._id,
        currentVersion: 1,
        scores: {
          complexity: 8.2,
          architecture: 89,
          security: 86,
          scalability: 88,
          maintainability: 91,
          performance: 87
        },
        latestBlueprint: foodBp,
        isDemo: true
      });

      await ProjectVersion.create({
        projectId: foodProject._id,
        versionNumber: 1,
        blueprint: foodBp,
        diff: { added: ['Initial Architecture Blueprint'], removed: [], changed: [] },
        changelog: 'Pre-generated Demo Architecture',
        createdBy: admin._id
      });

      console.log('[Seeder] Created demo project: Food Delivery Platform');
    }

    // Ensure second demo project: E-Commerce Cloud Marketplace
    const existingEcom = await Project.findOne({ isDemo: true, name: 'E-Commerce Cloud Marketplace' });
    if (!existingEcom) {
      const ecomProjectData = {
        name: 'E-Commerce Cloud Marketplace',
        description: 'Build an e-commerce platform where users can buy products, sellers can manage inventory, and admins can manage the platform.',
        targetUsers: 'B2C Shoppers, Verified Merchants, Catalog Managers, Finance Admins',
        expectedScale: 'Enterprise (500k+ MAU)',
        preferredPlatform: 'Web SaaS & Microservices',
        preferredTech: ['React.js', 'Express.js', 'PostgreSQL', 'Redis', 'Stripe', 'Docker']
      };

      const ecomBp = getDomainFallbackBlueprint(ecomProjectData);

      const ecomProject = await Project.create({
        ...ecomProjectData,
        owner: admin._id,
        currentVersion: 1,
        scores: {
          complexity: 7.8,
          architecture: 87,
          security: 85,
          scalability: 86,
          maintainability: 89,
          performance: 86
        },
        latestBlueprint: ecomBp,
        isDemo: true
      });

      await ProjectVersion.create({
        projectId: ecomProject._id,
        versionNumber: 1,
        blueprint: ecomBp,
        diff: { added: ['Initial Architecture Blueprint'], removed: [], changed: [] },
        changelog: 'Pre-generated Demo Architecture',
        createdBy: admin._id
      });

      console.log('[Seeder] Created demo project: E-Commerce Cloud Marketplace');
    }
  } catch (error) {
    console.error('[Seeder] Error during initial database seed:', error.message);
  }
};
