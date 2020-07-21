const url = './pdf/sample.pdf';

let pdfDoc = null,
pageNum = 1,
pageIsRendering = false,
pageNumIsPending = null;

const scale = 1,
canvas = document.querySelector('#pdf-render');
ctx = canvas.getContext('2d');

// Render Page
const renderPage = num => {
  pageIsRendering = true;

  // Get Page
  pdfDoc.getPage(num).then(page => {
    // Set Scale
    const viewport = page.getViewport({
      scale
    });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    }

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    })

    // Output current page
    document.querySelector('#page-num').textContent = num;

  })
}

// Check for page rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
}

// Prev page
const prevPage = () => {
  if (pageNum <= 1) {
    return;
  } else {
    pageNum--;
    queueRenderPage(pageNum);
  }
}

// Next page
const nextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  } else {
    pageNum++;
    queueRenderPage(pageNum);
  }
}

// Get Document
pdfjsLib.getDocument(url).promise
.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;
  document.querySelector('#page-count').textContent = pdfDoc.numPages;
  renderPage(pageNum);
})
.catch(err => {
  // Display error
  const div = document.createElement('div');
  div.className = 'error';
  div.appendChild(document.createTextNode(err.message));
  document.querySelector('.error-container').appendChild(div);
  document.querySelector('.nav').style.display = 'none';
})

// Button Events
document.querySelector('#prev').addEventListener('click', prevPage);
document.querySelector('#next').addEventListener('click', nextPage);