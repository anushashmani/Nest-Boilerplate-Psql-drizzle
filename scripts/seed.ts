async function seed() {
  console.log('Seeding database...');
  // Add your seeding logic here using Drizzle
}

seed()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed', err);
    process.exit(1);
  });
