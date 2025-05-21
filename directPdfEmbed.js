/*
 * directPdfEmbed.js - Alternative PDF embedding without iframes
 * This script provides a fallback method for embedding PDFs when 
 * iframe embedding might be blocked by security policies.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we have any Scribd containers that might need fallback
    const scribdContainers = document.querySelectorAll('.scribd-viewer');
    
    // Only run this if we have Scribd containers and if errors are detected
    if (scribdContainers.length > 0) {
        // After a short delay, check if we need to apply fallbacks
        setTimeout(checkForEmbedErrors, 1000);
        
        // Also add a backup check after a longer delay in case the first check happens too early
        setTimeout(checkForEmbedErrors, 3000);
    }
    
    function checkForEmbedErrors() {
        // Look for functioning iframe-based embeds
        const iframes = document.querySelectorAll('.scribd-iframe');
        
        iframes.forEach(iframe => {
            // Check if the iframe is blank, blocked, or otherwise not displaying content
            try {
                // If the iframe's content window can't be accessed, it might be blocked
                // This can throw a cross-origin error which we'll catch
                const testAccess = iframe.contentWindow || iframe.contentDocument;
                
                // Add a load event listener to check if the iframe loads correctly
                iframe.addEventListener('load', function() {
                    // If the iframe loads but is clearly empty, apply direct embed 
                    if (iframe.contentDocument && 
                        (iframe.contentDocument.body.innerHTML === '' || 
                         iframe.contentDocument.body.childNodes.length === 0)) {
                        applyDirectEmbed(iframe);
                    }
                });
                
                // Also check for iframe errors
                iframe.addEventListener('error', function() {
                    applyDirectEmbed(iframe);
                });
            } catch (e) {
                // If we caught an error, the iframe is probably blocked by CORS
                // Apply direct embedding without iframes
                applyDirectEmbed(iframe);
            }
        });
    }
      function applyDirectEmbed(iframe) {
        // Get the PDF source
        const pdfSrc = iframe.getAttribute('src');
        if (!pdfSrc) return;
        
        // Get parent container
        const container = iframe.parentNode;
        if (!container) return;
        
        // Create a direct embed container
        const directEmbed = document.createElement('div');
        directEmbed.className = 'direct-pdf-embed';
        directEmbed.style.width = '100%';
        directEmbed.style.height = '100%';
        directEmbed.style.position = 'relative';
        directEmbed.style.overflow = 'hidden';
        
        // Try to use blob URLs for better cross-origin handling
        tryFetchAsBlobAndEmbed(pdfSrc, directEmbed, iframe, container);
    }
    
    function tryFetchAsBlobAndEmbed(pdfSrc, directEmbed, iframe, container) {
        fetch(pdfSrc, { 
            method: 'GET',
            mode: 'cors', // Try CORS first
            cache: 'force-cache'
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
            
            // Create an object element for the PDF
            const objectElement = document.createElement('object');
            objectElement.setAttribute('data', blobUrl);
            objectElement.setAttribute('type', 'application/pdf');
            objectElement.setAttribute('width', '100%');
            objectElement.setAttribute('height', '100%');
            objectElement.style.border = 'none';
            
            // Add fallback content
            objectElement.innerHTML = createFallbackHTML(pdfSrc);
            
            // Add the object element to the direct embed container
            directEmbed.appendChild(objectElement);
            
            // Hide the original iframe and add our direct embed
            iframe.style.display = 'none';
            container.insertBefore(directEmbed, iframe);
        })
        .catch(error => {
            console.log('Could not fetch as blob, trying with embedded object:', error);
            
            // If blob approach fails, use direct object embedding
            const objectElement = document.createElement('object');
            objectElement.setAttribute('data', pdfSrc);
            objectElement.setAttribute('type', 'application/pdf');
            objectElement.setAttribute('width', '100%');
            objectElement.setAttribute('height', '100%');
            objectElement.style.border = 'none';
            
            // Add fallback content
            objectElement.innerHTML = createFallbackHTML(pdfSrc);
            
            // Add the object element to the direct embed container
            directEmbed.appendChild(objectElement);
            
            // Hide the original iframe and add our direct embed
            iframe.style.display = 'none';
            container.insertBefore(directEmbed, iframe);
        });
    }
    
    function createFallbackHTML(pdfSrc) {
        return `
            <div style="padding: 20px; text-align: center;">
                <p>Votre navigateur ne prend pas en charge l'affichage direct des PDF.</p>
                <a href="${pdfSrc}" target="_blank" 
                   style="display: inline-block; margin-top: 10px; padding: 8px 16px; 
                          background-color: #007bff; color: white; text-decoration: none; 
                          border-radius: 4px; font-weight: bold;">
                    Ouvrir le PDF dans un nouvel onglet
                </a>
                <a href="${pdfSrc}" download 
                   style="display: inline-block; margin-top: 10px; margin-left: 10px; 
                          padding: 8px 16px; background-color: #28a745; color: white; 
                          text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Télécharger le PDF
                </a>
            </div>
        `;
    }
});
