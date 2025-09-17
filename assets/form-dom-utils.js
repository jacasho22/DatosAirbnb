// Helpers for DOM-based tests
export function createGuestTemplateDocument(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc;
}

export function attachGuestTemplateToBody(doc) {
  // Move template into current document body if needed
  const template = doc.querySelector('#guest-template');
  if (template) {
    // Append template node to the real document body
    document.body.appendChild(template.cloneNode(true));
  }
}

export function createGuestFormsContainer() {
  const container = document.createElement('div');
  container.id = 'guest-forms-container';
  document.body.appendChild(container);
  return container;
}

export default { createGuestTemplateDocument, attachGuestTemplateToBody, createGuestFormsContainer };
