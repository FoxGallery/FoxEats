// Seed Côte d'Azur — implémenté lors de l'issue M2-seed.
// Squelette pour fixer le contrat et permettre la compilation.
export async function rivieraSeed(_ctx: {
  db: unknown;
  restaurants: unknown;
  menuCategories: unknown;
  menuItems: unknown;
  users: unknown;
}) {
  // TODO: M2 - charger ~30 restos répartis sur Nice, Cannes, Antibes, Monaco, Menton, Saint-Tropez, Cagnes, Grasse
  // avec un menu type (socca, pissaladière, salade niçoise, daube, pan-bagnat, pizza, burger, sushi).
  return { restaurantsInserted: 0, itemsInserted: 0 };
}
