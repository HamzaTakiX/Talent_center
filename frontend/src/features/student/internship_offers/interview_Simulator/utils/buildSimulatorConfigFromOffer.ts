import type { InternshipOfferDetails } from '../../types';
import type { SimulatorConfig } from '../types/interviewSimulatorDashboard';

export function buildOfferDescriptionForSimulator(offer: Pick<
  InternshipOfferDetails,
  'description' | 'requirements' | 'benefits'
>): string {
  return [offer.description, offer.requirements, offer.benefits].filter(Boolean).join('\n\n');
}

export function buildSimulatorConfigFromOffer(
  offer: InternshipOfferDetails,
): Partial<SimulatorConfig> {
  return {
    basis: 'offer',
    offerInputMode: 'manual',
    linkedOfferId: offer.id,
    customJobTitle: offer.title,
    customCompany: offer.company,
    customDescription: buildOfferDescriptionForSimulator(offer),
    offerUrl: offer.externalUrl,
    modeId: 'role-specific',
  };
}
