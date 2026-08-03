window.VIDA_COLLECTION_DEFAULTS = [
  {
    "price": "$5,000",
    "visibility": "public",
    "story": "The opening one-of-one cocktail ring and an anchor of the Vida collection. Flor de Vida is luminous, sculptural, and designed to feel unmistakably personal.",
    "id": "VIDA 001",
    "status": "One of One",
    "image": "https://drive.google.com/thumbnail?id=1STYhz_iuJAu4Yjxh0-z_c2SWWrG1y-_t&sz=w1600",
    "materials": "14K yellow gold • opal",
    "name": "Flor de Vida"
  },
  {
    "price": "By Commission",
    "visibility": "public",
    "story": "An open star at the ear with an elongated hollow lightning-bolt drop, created as a recognizable Vida signature. Graphic, light, and distinctive, it balances playful energy with a refined finish.",
    "id": "VIDA 002",
    "status": "In Development",
    "image": "",
    "materials": "10K or 14K yellow gold • openwork drop earring",
    "name": "Star / Bolt"
  },
  {
    "price": "Private Pricing",
    "visibility": "public",
    "story": "A luminous opal surrounded by an asymmetrical floral burst of color and flowing goldwork. Luz de Alé is expressive, feminine, and intended to remain one of one.",
    "id": "VIDA 003",
    "status": "Designer Review",
    "image": "https://drive.google.com/thumbnail?id=1RHhwrEkBw-TBh-aBR0pOJJdx49PDeWJb&sz=w1600",
    "materials": "14K yellow gold • white opal • multicolor accents",
    "name": "Luz de Alé"
  },
  {
    "price": "Private Pricing",
    "visibility": "public",
    "story": "A celestial black-opal composition framed by orbital arcs, gemstone points, and cosmic detail. Órbita captures the imaginative, symbolic side of the Vida point of view.",
    "id": "VIDA 004",
    "status": "Designer Review",
    "image": "https://drive.google.com/thumbnail?id=1-5tVLig0R4tZ_8RcpMcTnMIWPb7avkWj&sz=w1600",
    "materials": "14K yellow gold • black opal • colored gemstone accents",
    "name": "Órbita"
  },
  {
    "price": "Coming Soon",
    "visibility": "public",
    "story": "A continuous interwoven band with rounded polished strands and visible openings, exploring connection, movement, and sculptural simplicity through the Vida design language.",
    "id": "VIDA 005",
    "status": "Coming Soon",
    "image": "https://drive.google.com/thumbnail?id=1FA4GqgSnIixn2i2gXGOV8CrwGIO4FzkK&sz=w1600",
    "materials": "14K yellow gold • two-strand interwoven band • open negative space",
    "name": "Entrelazado"
  },
  {
    "price": "Private",
    "visibility": "hidden",
    "story": "A light sculptural ring direction built around a graceful looping gold form.",
    "id": "VIDA 006",
    "status": "Designer Review",
    "image": "",
    "materials": "14K yellow gold • gemstone center",
    "name": "Lazo de Luz"
  },
  {
    "price": "Private",
    "visibility": "hidden",
    "story": "A more architectural interpretation of the interwoven Vida language for a statement ring.",
    "id": "VIDA 007",
    "status": "Designer Review",
    "image": "",
    "materials": "14K yellow gold",
    "name": "Lazo Eterno"
  },
  {
    "price": "Private",
    "visibility": "hidden",
    "story": "A bold color-led statement piece exploring heat, movement, and paired forms.",
    "id": "VIDA 008",
    "status": "Designer Review",
    "image": "",
    "materials": "14K yellow gold • warm-toned gemstones",
    "name": "Fuego Unido"
  },
  {
    "price": "From $650",
    "visibility": "hidden",
    "story": "A personal talisman created around a milestone, memory, birthstone, or meaningful symbol. Vida Talisman No. 1 offers an intimate entry into the collection while preserving its sculptural goldwork and gemstone-led identity.",
    "id": "VIDA 009",
    "status": "Coming Soon",
    "image": "",
    "materials": "14K yellow gold • opal or birthstone center • talisman pendant",
    "name": "Vida Talisman No. 1"
  }
];

// Preserve the established accessible placeholder while allowing the inquiry
// choices themselves to be expanded by app.js.
function normalizeVidaInterestPlaceholder() {
  const select = document.getElementById('interestSelect');
  const placeholder = select?.querySelector('option[value=""]');
  if (placeholder && placeholder.textContent !== 'Choose an option') {
    placeholder.textContent = 'Choose an option';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('interestSelect');
  if (!select) return;
  const observer = new MutationObserver(normalizeVidaInterestPlaceholder);
  observer.observe(select, {childList: true});
  normalizeVidaInterestPlaceholder();
});
