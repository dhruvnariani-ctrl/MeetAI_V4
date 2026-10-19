// TODO: replace with a call to the Darwin employee directory API.
// Must resolve to [{ name, email }] for a search string.
const PEOPLE = [
  { name: 'Aarav Mehta', email: 'aarav.mehta@avaada.com' },
  { name: 'Ananya Rao', email: 'ananya.rao@avaada.com' },
  { name: 'Karan Malhotra', email: 'karan.malhotra@avaada.com' },
  { name: 'Meera Iyer', email: 'meera.iyer@avaada.com' },
  { name: 'Rohan Desai', email: 'rohan.desai@avaada.com' },
  { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@avaada.com' },
]

export async function searchDirectory(query) {
  const q = query.toLowerCase()
  await new Promise((r) => setTimeout(r, 150))
  return PEOPLE.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)).slice(0, 8)
}