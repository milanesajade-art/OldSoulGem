// Functional V2 policy overrides loaded after creator.js.
// Hidden drafts may remain incomplete; public pieces must be production-ready.
function validatePiece(piece) {
  const errors = [];
  const warnings = [];
  if (!String(piece?.name || '').trim()) errors.push('Name is required.');

  if (piece?.visibility === 'public') {
    if (!String(piece.materials || '').trim()) errors.push('Materials are required.');
    if (!String(piece.story || '').trim()) errors.push('Story is required.');
    if (!String(piece.price || '').trim()) errors.push('Price or display value is required.');
    if (!piece.image && piece.id !== 'VIDA 002') errors.push('Public piece needs a production image before publishing.');
  } else {
    if (!String(piece?.materials || '').trim()) warnings.push('Hidden draft has no materials yet.');
    if (!String(piece?.story || '').trim()) warnings.push('Hidden draft has no story yet.');
    if (!String(piece?.price || '').trim()) warnings.push('Hidden draft has no price/display value yet.');
    if (!piece?.image) warnings.push('Hidden draft has no image yet.');
  }
  return {errors, warnings};
}

function publishErrors() {
  const collectionErrors = workspace.pieces.length ? [] : ['Collection: at least one piece is required.'];
  return [
    ...collectionErrors,
    ...workspace.pieces.flatMap((piece) => validatePiece(piece).errors.map((message) => `${piece.id}: ${message}`)),
    ...validateSite()
  ];
}
