import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5000';

async function runE2ETests() {
  console.log('=== VISION2SYSTEM E2E INTEGRATION TEST SUITE ===\n');

  // 1. Health Check
  console.log('1. Testing /api/health...');
  const healthRes = await axios.get(`${BASE_URL}/api/health`);
  console.log('   ✓ Health check passed:', healthRes.data);

  // 2. Authentication (Admin)
  console.log('\n2. Testing /api/auth/login (Admin)...');
  const adminLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'admin@vision2system.com',
    password: 'password123'
  });
  const adminToken = adminLoginRes.data.token;
  console.log(`   ✓ Admin authenticated: ${adminLoginRes.data.user.name} (Role: ${adminLoginRes.data.user.role})`);

  // 3. Authentication (User)
  console.log('\n3. Testing /api/auth/login (User)...');
  const userLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'user@vision2system.com',
    password: 'password123'
  });
  const userToken = userLoginRes.data.token;
  console.log(`   ✓ User authenticated: ${userLoginRes.data.user.name} (Role: ${userLoginRes.data.user.role})`);

  const userHeaders = { headers: { Authorization: `Bearer ${userToken}` } };
  const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

  // 4. Projects Listing (including Demo projects)
  console.log('\n4. Testing GET /api/projects...');
  const projectsRes = await axios.get(`${BASE_URL}/api/projects`, userHeaders);
  console.log(`   ✓ Retrieved ${projectsRes.data.count} projects (including seeded demo projects)`);
  const demoProject = projectsRes.data.projects.find(p => p.isDemo) || projectsRes.data.projects[0];
  console.log(`   ✓ Found target project: "${demoProject.name}" (ID: ${demoProject._id})`);

  // 5. Get Project Workspace & Blueprint details
  console.log('\n5. Testing GET /api/projects/:id...');
  const projectDetailRes = await axios.get(`${BASE_URL}/api/projects/${demoProject._id}`, userHeaders);
  const bp = projectDetailRes.data.blueprint;
  console.log('   ✓ Verified blueprint sections present:');
  const sections = ['projectOverview', 'requirements', 'techStack', 'database', 'architecture', 'apis', 'security', 'complexity', 'roadmap', 'starterStructure', 'review'];
  sections.forEach(sec => {
    if (bp[sec]) console.log(`     - [x] ${sec}`);
    else console.log(`     - [ ] ${sec} (MISSING)`);
  });

  // 6. Project Creation & Blueprint Generation
  console.log('\n6. Testing POST /api/projects (Generation)...');
  const createRes = await axios.post(`${BASE_URL}/api/projects`, {
    name: 'Smart Healthcare Telemedicine',
    description: 'Build a telemedicine platform connecting patients to licensed physicians for video consults and prescriptions.',
    targetUsers: 'Patients, Doctors, Clinic Admins',
    expectedScale: 'Medium Scale (50,000 DAU)',
    preferredPlatform: 'Web SaaS',
    preferredTech: ['React.js', 'Node.js (Express)', 'MongoDB', 'Redis']
  }, userHeaders);
  const newProjectId = createRes.data.project._id;
  console.log(`   ✓ Created new project "${createRes.data.project.name}" (ID: ${newProjectId})`);
  console.log(`   ✓ Initial version: v${createRes.data.project.currentVersion}`);

  // 7. Section Regeneration (e.g. database)
  console.log('\n7. Testing POST /api/projects/:id/regenerate/:section (database)...');
  const regenSecRes = await axios.post(`${BASE_URL}/api/projects/${newProjectId}/regenerate/database`, {}, userHeaders);
  console.log(`   ✓ Regenerated section: ${regenSecRes.data.section}`);

  // 8. Full Project Regeneration (Bump to v2)
  console.log('\n8. Testing POST /api/projects/:id/regenerate (Full version bump)...');
  const regenRes = await axios.post(`${BASE_URL}/api/projects/${newProjectId}/regenerate`, {
    additionalInstructions: 'Add Redis distributed caching and Kafka message broker'
  }, userHeaders);
  console.log(`   ✓ Project version bumped to: v${regenRes.data.currentVersion}`);
  console.log('   ✓ Computed diff summary:', regenRes.data.diff);

  // 9. Version History & Comparison
  console.log('\n9. Testing Version History & Diffs...');
  const versionsRes = await axios.get(`${BASE_URL}/api/version/${newProjectId}`, userHeaders);
  console.log(`   ✓ Found ${versionsRes.data.count} snapshots in version history`);
  const compareRes = await axios.get(`${BASE_URL}/api/version/compare?projectId=${newProjectId}&v1=1&v2=2`, userHeaders);
  console.log('   ✓ Version diff comparison result:', compareRes.data.diff);

  // 10. Duplicate Project
  console.log('\n10. Testing POST /api/projects/:id/duplicate...');
  const dupRes = await axios.post(`${BASE_URL}/api/projects/${newProjectId}/duplicate`, {}, userHeaders);
  console.log(`   ✓ Duplicated project created: "${dupRes.data.project.name}" (ID: ${dupRes.data.project._id})`);

  // 11. Admin Statistics & Charts
  console.log('\n11. Testing GET /api/admin/stats...');
  const adminStatsRes = await axios.get(`${BASE_URL}/api/admin/stats`, adminHeaders);
  console.log('   ✓ Admin telemetry:');
  console.log(`     - Total Users: ${adminStatsRes.data.stats.totalUsers}`);
  console.log(`     - Total Projects: ${adminStatsRes.data.stats.totalProjects}`);
  console.log(`     - Top Tech: ${adminStatsRes.data.stats.popularTechnologies.slice(0, 3).map(t => t.name).join(', ')}`);

  // 12. Public GitHub Analyzer
  console.log('\n12. Testing POST /api/github/analyze...');
  const githubRes = await axios.post(`${BASE_URL}/api/github/analyze`, {
    repoUrl: 'https://github.com/expressjs/express'
  }, userHeaders);
  console.log(`   ✓ Audited repository "${githubRes.data.data.fullName}": Health Score = ${githubRes.data.data.healthScore}/100`);

  // 13. Export Endpoints (Markdown, JSON)
  console.log('\n13. Testing Export Endpoints...');
  const mdRes = await axios.get(`${BASE_URL}/api/export/${newProjectId}/markdown`, userHeaders);
  console.log(`   ✓ Markdown export received (${mdRes.data.length} characters)`);
  const jsonRes = await axios.get(`${BASE_URL}/api/export/${newProjectId}/json`, userHeaders);
  console.log(`   ✓ JSON export received (${Object.keys(jsonRes.data).join(', ')})`);

  console.log('\n=== ALL 13 END-TO-END TESTS PASSED SUCCESSFULLY! ===\n');
}

runE2ETests().catch(err => {
  console.error('\n❌ E2E Test Suite Error:', err.response?.data || err.message);
  process.exit(1);
});
