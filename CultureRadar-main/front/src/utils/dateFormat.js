export function formatEventDate(date_debut, date_fin) {
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  const d1 = new Date(date_debut);
  const d2 = date_fin ? new Date(date_fin) : null;

  const jour1 = d1.getDate();
  const mois1 = mois[d1.getMonth()];
  const annee1 = d1.getFullYear();

  if (!d2 || date_debut === date_fin) {
    return `Le ${jour1} ${mois1} ${annee1}`;
  }

  const jour2 = d2.getDate();
  const mois2 = mois[d2.getMonth()];
  const annee2 = d2.getFullYear();

  if (annee1 === annee2) {
    if (mois1 === mois2) {
      return `Du ${jour1} au ${jour2} ${mois1} ${annee1}`;
    }
    return `Du ${jour1} ${mois1} au ${jour2} ${mois2} ${annee1}`;
  }
  return `Du ${jour1} ${mois1} ${annee1} au ${jour2} ${mois2} ${annee2}`;
}