/**
 * blobPdfLoader.js - Advanced PDF loading strategy with Blob URLs
 * This script provides a more robust way to load PDFs with blob URLs to avoid CORS issues
 * and enables better compatibility across browsers and security policies.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure other scripts have initialized
    setTimeout(initializeBlobLoader, 1000);

    function initializeBlobLoader() {
        // Get all PDF containers, including those created by scribdStyle.js
        const pdfContainers = document.querySelectorAll('.scribd-pdf-container, .scribd-viewer');
        const iframes = document.querySelectorAll('.scribd-iframe');
        
        // First, try to fix any existing iframes that might be having issues
        iframes.forEach(iframe => {
            // Check if the iframe has loaded content successfully
            if (iframe.contentDocument && !iframe.contentDocument.body.innerHTML) {
                const pdfSrc = iframe.getAttribute('src');
                if (pdfSrc && !pdfSrc.startsWith('blob:')) {
                    convertToBlobUrl(pdfSrc, iframe);
                }
            }
        });
        
        // Next, check for PDF containers that might need additional help
        pdfContainers.forEach(container => {
            const pdfSrc = container.getAttribute('data-pdf-src');
            if (!pdfSrc) return;
            
            // Find the iframe inside this container
            const iframe = container.querySelector('.scribd-iframe');
            if (!iframe) return;
            
            // Check if the iframe has problems
            checkIframeStatus(iframe, pdfSrc);
        });
    }
    
    function checkIframeStatus(iframe, pdfSrc) {
        // If iframe src is empty or hasn't been set yet
        if (!iframe.getAttribute('src')) {
            convertToBlobUrl(pdfSrc, iframe);
            return;
        }
        
        // If iframe has cross-origin issues
        try {
            const testAccess = iframe.contentWindow || iframe.contentDocument;
            if (!testAccess) {
                convertToBlobUrl(pdfSrc, iframe);
            }
        } catch (e) {
            // Cross-origin error occurred
            convertToBlobUrl(pdfSrc, iframe);
        }
        
        // Listen for iframe load errors
        iframe.addEventListener('error', function() {
            convertToBlobUrl(pdfSrc, iframe);
        });
    }
    
    function convertToBlobUrl(url, iframe) {
        // Try different fetch strategies in sequence
        fetchWithStrategy(url, 'cors')
            .catch(() => fetchWithStrategy(url, 'no-cors'))
            .catch(() => fetchWithStrategy(url, 'same-origin'))
            .then(blob => {
                if (blob) {
                    const blobUrl = URL.createObjectURL(blob);
                    iframe.src = blobUrl;
                    
                    // Register cleanup 
                    window.addEventListener('beforeunload', function() {
                        URL.revokeObjectURL(blobUrl);
                    });
                }
            })
            .catch(error => {
                console.error('All fetch strategies failed:', error);
                // Last resort - direct src attribute
                iframe.src = url;
                
                // Try using an object element as fallback
                tryObjectElementFallback(url, iframe);
            });
    }
    
    function fetchWithStrategy(url, mode) {
        return fetch(url, {
            method: 'GET',
            mode: mode,
            cache: 'force-cache',
            credentials: 'omit',
            headers: {
                'Accept': 'application/pdf'
            }
        })
        .then(response => {
            if (mode === 'no-cors') {
                // For no-cors, we can't check response.ok, so just return what we got
                return response.blob();
            }
            
            if (!response.ok) {
                throw new Error(`Fetch failed with status: ${response.status}`);
            }
            return response.blob();
        });
    }
    
    function tryObjectElementFallback(url, iframe) {
        // Create an object element as a fallback
        const objectElement = document.createElement('object');
        objectElement.setAttribute('data', url);
        objectElement.setAttribute('type', 'application/pdf');
        objectElement.setAttribute('width', '100%');
        objectElement.setAttribute('height', '100%');
        objectElement.style.border = 'none';
        
        // Add fallback content
        objectElement.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p>Le PDF ne peut pas être affiché directement. Veuillez utiliser les liens ci-dessous.</p>
                <a href="${url}" target="_blank" 
                   style="display: inline-block; margin-top: 10px; padding: 8px 16px; 
                          background-color: #007bff; color: white; text-decoration: none; 
                          border-radius: 4px; font-weight: bold;">
                    Ouvrir le PDF dans un nouvel onglet
                </a>
                <a href="${url}" download 
                   style="display: inline-block; margin-top: 10px; margin-left: 10px; 
                          padding: 8px 16px; background-color: #28a745; color: white; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Télécharger le PDF
                </a>
            </div>
        `;
        
        // Replace iframe with object if iframe appears to be empty or blocked
        setTimeout(() => {
            try {
                if (!iframe.contentDocument || !iframe.contentDocument.body || !iframe.contentDocument.body.innerHTML) {
                    iframe.style.display = 'none';
                    iframe.parentNode.insertBefore(objectElement, iframe);
                }
            } catch (e) {
                // If error accessing contentDocument (likely CORS), apply fallback
                iframe.style.display = 'none';
                iframe.parentNode.insertBefore(objectElement, iframe);
            }
        }, 2000); // Wait 2 seconds to check iframe content
    }
});