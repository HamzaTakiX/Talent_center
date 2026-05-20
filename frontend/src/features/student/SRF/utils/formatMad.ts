/** Format montant MAD avec espaces (ex. 15 000 MAD). */
export function formatMad(amount: number): string {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} MAD`;
}
