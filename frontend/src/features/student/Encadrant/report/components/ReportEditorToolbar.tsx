import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Palette,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react';
import {
  REPORT_TOOLBAR,
  REPORT_TOOLBAR_BTN,
  REPORT_TOOLBAR_SELECT,
} from '../constants/reportStyles';

export default function ReportEditorToolbar() {
  return (
    <div
      className={`${REPORT_TOOLBAR} mx-3 mb-0 mt-3 sm:mx-4`}
      role="toolbar"
      aria-label="Barre d'outils de l'éditeur"
    >
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Annuler">
        <Undo2 className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Rétablir">
        <Redo2 className="h-4 w-4" />
      </button>
      <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-[#d1d5db] sm:inline" aria-hidden />
      <label className="sr-only" htmlFor="report-style-select">
        Style
      </label>
      <select id="report-style-select" className={REPORT_TOOLBAR_SELECT} defaultValue="normal">
        <option value="normal">Style</option>
        <option value="h1">Titre 1</option>
        <option value="h2">Titre 2</option>
      </select>
      <label className="sr-only" htmlFor="report-size-select">
        Taille
      </label>
      <select id="report-size-select" className={REPORT_TOOLBAR_SELECT} defaultValue="14">
        <option value="12">12</option>
        <option value="14">Taille</option>
        <option value="16">16</option>
        <option value="18">18</option>
      </select>
      <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-[#d1d5db] sm:inline" aria-hidden />
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Gras">
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Italique">
        <Italic className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Souligné">
        <Underline className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Couleur du texte">
        <Palette className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Effacer le formatage">
        <Eraser className="h-4 w-4" />
      </button>
      <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-[#d1d5db] sm:inline" aria-hidden />
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Aligner à gauche">
        <AlignLeft className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Centrer">
        <AlignCenter className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Aligner à droite">
        <AlignRight className="h-4 w-4" />
      </button>
      <span className="mx-0.5 hidden h-6 w-px shrink-0 bg-[#d1d5db] sm:inline" aria-hidden />
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Liste à puces">
        <List className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Liste numérotée">
        <ListOrdered className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Insérer un lien">
        <Link2 className="h-4 w-4" />
      </button>
      <button type="button" className={REPORT_TOOLBAR_BTN} aria-label="Ligne horizontale">
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}
