window.VIDA_COLLECTION_DEFAULTS = [
  {
    "id": "OSG 001",
    "name": "Wire-Wrapped Crystal Earrings",
    "status": "On Etsy",
    "visibility": "public",
    "price": "$30 on Etsy",
    "materials": "Rose quartz • clear quartz • amethyst • quartz • wirework",
    "story": "Handmade dangling earrings that bring together softly colored natural stones and expressive wirework. Each pair celebrates the small variations that make crystal jewelry feel personal.",
    "image": "assets/old-soul-earrings.svg",
    "shopUrl": "https://www.etsy.com/listing/4356782794/handmade-wire-wrapped-crystal-earrings"
  },
  {
    "id": "OSG 002",
    "name": "Labradorite & Black Agate Pendants",
    "status": "On Etsy",
    "visibility": "public",
    "price": "$22.50 on Etsy",
    "materials": "Labradorite • black agate • natural-stone charm",
    "story": "Natural-stone pendants selected for their depth, contrast, and individual character. Designed to be worn as a meaningful everyday charm or layered with other favorites.",
    "image": "assets/old-soul-pendant.svg",
    "shopUrl": "https://www.etsy.com/listing/4356839510/crystal-pendant-labradorite-black-agate"
  },
  {
    "id": "OSG 003",
    "name": "Root-to-Crown Chakra Bracelets",
    "status": "On Etsy",
    "visibility": "public",
    "price": "$21 on Etsy",
    "materials": "Intuitively selected stones • chakra-inspired color collection",
    "story": "A root-to-crown bracelet collection arranged around color, symbolism, and personal intention. Choose the bracelet that speaks to the season or energy you are exploring.",
    "image": "assets/old-soul-bracelet.svg",
    "shopUrl": "https://www.etsy.com/listing/4442388030/chakra-bracelet-collection-root-to-crown"
  },
  {
    "id": "OSG 004",
    "name": "Crystal Chain Earrings",
    "status": "On Etsy",
    "visibility": "public",
    "price": "$30 on Etsy",
    "materials": "Rose quartz • smoky quartz • obsidian • sterling-silver chain",
    "story": "Long, lightweight crystal earrings combining soft rose quartz, smoky depth, and obsidian contrast on a delicate chain silhouette.",
    "image": "assets/old-soul-earrings.svg",
    "shopUrl": "https://www.etsy.com/listing/4356797708/handmade-crystal-dangling-earrings-rose"
  },
  {
    "id": "OSG 005",
    "name": "Natural Crystal Suncatcher",
    "status": "On Etsy",
    "visibility": "public",
    "price": "$21 on Etsy",
    "materials": "Natural crystals • glass • metal • hanging decor",
    "story": "A handmade suncatcher for a window, reading corner, altar, or other meaningful space. Natural stones and reflective elements bring light, movement, and color into the room.",
    "image": "assets/old-soul-suncatcher.svg",
    "shopUrl": "https://www.etsy.com/listing/4356903799/handmade-crystal-suncatcher-natural"
  },
  {
    "id": "OSG 006",
    "name": "Handmade & Thrifted Crystal Necklaces",
    "status": "On Etsy",
    "visibility": "public",
    "price": "$11.25 on Etsy",
    "materials": "Clay • hematite • crystal details • layered vintage components",
    "story": "Layered statement necklaces combining handmade details with thoughtfully thrifted elements. This collection reflects Old Soul Gem's belief in giving meaningful materials a new life.",
    "image": "assets/old-soul-pendant.svg",
    "shopUrl": "https://www.etsy.com/listing/4356886717/handmade-thrifted-crystal-necklaces-clay"
  },
  {
    "id": "OSG 007",
    "name": "Sculptural Clay Crystal Talisman",
    "status": "On Etsy",
    "visibility": "public",
    "price": "$24 on Etsy",
    "materials": "Hand-shaped clay • crystal • sterling-silver chain",
    "story": "A one-of-a-kind sculptural pendant that brings crystal, clay, and wearable art together as a small ritual object and personal talisman.",
    "image": "assets/old-soul-incense.svg",
    "shopUrl": "https://www.etsy.com/listing/4402644242/handmade-clay-crystal-pendant-sculptural"
  },
  {
    "id": "OSG 008",
    "name": "Vintage Sterling-Silver Crystal Rings",
    "status": "On Etsy",
    "visibility": "public",
    "price": "$30 on Etsy",
    "materials": "925 sterling silver • assorted natural stones • vintage find",
    "story": "A rotating collection of vintage sterling-silver rings in assorted crystal colors. Each ring has its own shape, patina, stone character, and history.",
    "image": "assets/old-soul-ring.svg",
    "shopUrl": "https://www.etsy.com/listing/4356841138/vintage-925-sterling-silver-crystal"
  },
  {
    "id": "OSG 009",
    "name": "Custom Intention Piece",
    "status": "Custom Request",
    "visibility": "public",
    "price": "Ask Alejandra",
    "materials": "Selected stones • handmade or curated components • personal direction",
    "story": "Begin with a color, crystal, memory, milestone, or intention. Custom requests are developed through conversation and depend on stone and material availability.",
    "image": "assets/old-soul-bracelet.svg",
    "shopUrl": "https://linktr.ee/oldsoulgem"
  }
];

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