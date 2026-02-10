/**
 * Let's Rendez – Brand theme (docs/BRAND.md)
 * Use these constants in screens and components for consistent colors and typography.
 */

export const colors = {
  primary: '#356769',      // Teal — headers, primary buttons, key surfaces
  background: '#fbfcfb',   // Off-white — screen and card backgrounds
  accent: '#c6a77a',       // Tan/gold — highlights, secondary emphasis
  secondary: '#afae8f',    // Sage/olive — borders, subtle accents, secondary buttons
  white: '#ffffff',        // Text/icons on primary
  textOnLight: '#1a3a3d',  // Primary text on light backgrounds (accessibility)
  textMuted: '#1f2937',    // Alternative dark text
};

export const fonts = {
  heading: 'Montserrat',   // Titles, screen titles, card titles — semi-bold/bold
  body: 'Open Sans',       // Paragraphs, labels, inputs, buttons — regular/medium
};

/** Common font sizes (use with fonts.heading / fonts.body) */
export const fontSizes = {
  screenTitle: 24,
  cardTitle: 18,
  body: 16,
  label: 14,
  caption: 12,
};

export default { colors, fonts, fontSizes };
