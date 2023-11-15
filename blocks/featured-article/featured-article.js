import { createOptimizedPicture } from '../../scripts/aem.js';

async function loadFragment(path) {
    if (path && path.startsWith('/')) {
      const resp = await fetch(path);
      if (resp.ok) {
        const parser = new DOMParser();
        return parser.parseFromString(await resp.text(), 'text/html');
      }
    }
    return null;
}

function getMetadata(name, doc = document) {
    const attr = name && name.includes(':') ? 'property' : 'name';
    const meta = [...doc.head.querySelectorAll(`meta[${attr}="${name}"]`)].map((m) => m.content).join(', ');
    return meta || '';
}
  

export default async function decorate(block) {
    const link = block.querySelector('a');
    const path = link ? link.getAttribute('href') : block.textContent.trim();
    const doc = await loadFragment(path);
    if (!doc) {
        return;
    }

    const title = getMetadata('og:title', doc);
    const desc = getMetadata('og:description', doc);
    const image = getMetadata('og:image', doc);

    /**
     * Add a Featured Article as the pretitle
     */
    const pre = document.createElement('p');
    pre.classList.add('pretitle');
    pre.textContent = 'Featured Article';

    /**
     * Add the title from the metadata
     */
    const h2 = document.createElement('h2');
    h2.textContent = title;

    /**
     * Add the desc.
     */
    const p = document.createElement('p');
    p.textContent = desc;

    /**
     * Create a call to action button.
     */
    const cta = document.createElement('div');
    cta.append(link);
    link.textContent = 'Read More';
    link.className = 'button primary';

    /**
     * Add a div that can contain all the elements.
     */
    const text = document.createElement('div');
    text.classList.add('text');
    text.append(pre, h2, p, cta);

    const picture = document.createElement('div');
    picture.append(createOptimizedPicture(image));
    picture.classList.add('image');

    /**
     * Replace with the new content
     */
    block.replaceChildren(picture, text);
}