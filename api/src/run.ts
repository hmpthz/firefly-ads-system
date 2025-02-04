const app = (await import('./index.js')).default;

const PORT = 8079;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
