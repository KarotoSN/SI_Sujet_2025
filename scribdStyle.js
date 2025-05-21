/* 
 * scribdStyle.js - Creates a Scribd-like PDF viewer similar to letudiant.fr
 * This file implements a PDF viewer that resembles the one used on letudiant.fr,
 * which is based on Scribd's embedding system.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply Scribd-like styling to all PDF containers
    const pdfContainers = document.querySelectorAll('.scribd-pdf-container');
    
    pdfContainers.forEach(container => {
        const pdfSrc = container.getAttribute('data-pdf-src');
        const pdfTitle = container.getAttribute('data-pdf-title') || 'Document PDF';
        const pdfAuthor = container.getAttribute('data-pdf-author') || 'SI Sujet 2025';
        
        // Create the Scribd-like container structure
        container.classList.add('scribd-viewer');
        
        // Create the header bar
        const headerBar = document.createElement('div');
        headerBar.className = 'scribd-header';
        
        // Add title and author info
        const titleElement = document.createElement('div');
        titleElement.className = 'scribd-title';
        titleElement.textContent = pdfTitle;
        
        const authorElement = document.createElement('div');
        authorElement.className = 'scribd-author';
        authorElement.textContent = `par ${pdfAuthor}`;
        
        headerBar.appendChild(titleElement);
        headerBar.appendChild(authorElement);
        
        // Create the document display area
        const documentDisplay = document.createElement('div');
        documentDisplay.className = 'scribd-document';        // Create iframe for PDF content
        const iframe = document.createElement('iframe');
        iframe.className = 'scribd-iframe';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation');
        iframe.setAttribute('referrerpolicy', 'no-referrer');
        iframe.setAttribute('importance', 'high');
        
        // Try to fetch PDF as blob for better cross-origin compatibility
        tryFetchPdfAsBlob(pdfSrc, iframe);
        
        // Add fallback content
        iframe.innerHTML = `
            <p>Votre navigateur ne supporte pas l'affichage des PDF.
            <a href="${pdfSrc}" target="_blank">Cliquez ici pour voir le PDF</a>.</p>
        `;
        
        // Add a loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'scribd-loading';
        loadingIndicator.innerHTML = '<div class="scribd-loading-spinner"></div><p>Chargement du document...</p>';
        
        // Add the document actions footer
        const docActions = document.createElement('div');
        docActions.className = 'scribd-actions';
        
        // Create view button
        const viewButton = document.createElement('a');
        viewButton.href = pdfSrc;
        viewButton.target = '_blank';
        viewButton.className = 'scribd-button scribd-view';
        viewButton.textContent = 'Voir en plein écran';
        
        // Create download button
        const downloadButton = document.createElement('a');
        downloadButton.href = pdfSrc;
        downloadButton.download = '';
        downloadButton.className = 'scribd-button scribd-download';
        downloadButton.textContent = 'Télécharger';
        
        // Assemble the document actions
        docActions.appendChild(viewButton);
        docActions.appendChild(downloadButton);
        
        // Assemble all components
        documentDisplay.appendChild(loadingIndicator);
        documentDisplay.appendChild(iframe);
        
        container.appendChild(headerBar);
        container.appendChild(documentDisplay);
        container.appendChild(docActions);
        
        // Handle iframe load event to remove loading indicator
        iframe.onload = function() {
            loadingIndicator.style.display = 'none';
        };
        
        // Handle iframe error
        iframe.onerror = function() {
            loadingIndicator.innerHTML = '<p>Erreur de chargement. Veuillez télécharger le document.</p>';
        };
    });
      // For older browsers or mobile devices that don't support PDF embedding
    function handleFallbacks() {
        const iframes = document.querySelectorAll('.scribd-iframe');
        
        // Check if PDF viewing is supported
        const isPdfSupported = 
            navigator.mimeTypes && 
            navigator.mimeTypes['application/pdf'] && 
            navigator.mimeTypes['application/pdf'].enabledPlugin;
            
        // Check if on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isPdfSupported || isMobile) {
            iframes.forEach(iframe => {
                const container = iframe.closest('.scribd-viewer');
                const pdfSrc = iframe.getAttribute('src');
                
                // Try a different embedding approach with object tag
                const objectEl = document.createElement('object');
                objectEl.setAttribute('data', pdfSrc);
                objectEl.setAttribute('type', 'application/pdf');
                objectEl.setAttribute('width', '100%');
                objectEl.setAttribute('height', '100%');
                objectEl.style.height = iframe.style.height || '100%';
                
                // Add a fallback message inside the object
                objectEl.innerHTML = `
                    <div class="scribd-preview-message">
                        <p>Pour une meilleure expérience, veuillez ouvrir ce document.</p>
                        <a href="${pdfSrc}" target="_blank" class="scribd-button scribd-view">Ouvrir le document</a>
                    </div>
                `;
                
                // Replace iframe with object in some cases
                if (!isPdfSupported) {
                    iframe.style.display = 'none';
                    iframe.parentNode.insertBefore(objectEl, iframe);
                }
                
                // For all cases, also add the preview option
                const previewContainer = document.createElement('div');
                previewContainer.className = 'scribd-preview-container';
                previewContainer.style.display = 'none'; // Hidden by default
                
                // Add PDF preview message
                const previewMessage = document.createElement('div');
                previewMessage.className = 'scribd-preview-message';
                previewMessage.innerHTML = `
                    <p>Pour une meilleure expérience, veuillez ouvrir ce document.</p>
                    <a href="${pdfSrc}" target="_blank" class="scribd-button scribd-view">Ouvrir le document</a>
                `;
                
                previewContainer.appendChild(previewMessage);
                iframe.parentNode.insertBefore(previewContainer, iframe.nextSibling);
                
                // Add error handler to show preview if iframe fails
                iframe.onerror = function() {
                    iframe.style.display = 'none';
                    previewContainer.style.display = 'flex';
                };
            });
        }
    }
      // Call fallback handler
    handleFallbacks();

    // Function to try fetching PDF as blob for better cross-origin handling
    function tryFetchPdfAsBlob(pdfSrc, iframe) {
        fetch(pdfSrc, { 
            method: 'GET',
            mode: 'cors', // Try CORS first
            cache: 'force-cache',
            credentials: 'omit'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            // Create a blob URL from the fetched PDF
            const blobUrl = URL.createObjectURL(blob);
            
            // Set the iframe source to the blob URL
            iframe.src = blobUrl;
            
            // Clean up the blob URL when the iframe is removed
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.removedNodes.forEach(function(node) {
                        if (node === iframe) {
                            URL.revokeObjectURL(blobUrl);
                            observer.disconnect();
                        }
                    });
                });
            });
            
            observer.observe(iframe.parentNode, { childList: true });
        })
        .catch(error => {
            console.log('Could not fetch as blob, falling back to direct src:', error);
            // Fallback to direct source
            iframe.src = pdfSrc;
            
            // If CORS failed, try no-cors as a last resort
            if (error.message.includes('CORS')) {
                fetch(pdfSrc, { 
                    method: 'GET',
                    mode: 'no-cors',
                    cache: 'force-cache',
                    credentials: 'omit'
                })
                .then(response => response.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    iframe.src = blobUrl;
                })
                .catch(() => {
                    // Ultimate fallback
                    console.log('All fetch methods failed, using direct src');
                });
            }
        });
    }
});
