/* fallbackPdf.js: Handles PDF display with fallbacks and advanced features */
document.addEventListener('DOMContentLoaded', function() {
    // Function to check if PDF viewing is supported in the browser
    function isPdfViewingSupported() {
        return navigator.mimeTypes && 
               navigator.mimeTypes['application/pdf'] && 
               navigator.mimeTypes['application/pdf'].enabledPlugin;
    }

    // Function to check if we're running on a mobile device
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Get all the pdf iframe elements on the page
    const pdfFrames = document.querySelectorAll('iframe[type="application/pdf"]');
    
    pdfFrames.forEach(frame => {
        const pdfPath = frame.getAttribute('src');
        
        // Add loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'pdf-loading';
        loadingMessage.textContent = 'Chargement du PDF...';
        loadingMessage.style.textAlign = 'center';
        loadingMessage.style.padding = '20px';
        loadingMessage.style.backgroundColor = '#f8f9fa';
        loadingMessage.style.border = '1px solid #dee2e6';
        loadingMessage.style.borderRadius = '5px';
        loadingMessage.style.marginTop = '10px';
        
        frame.parentNode.insertBefore(loadingMessage, frame);
        
        // Create backup object tag for better compatibility
        const obj = document.createElement('object');
        obj.setAttribute('data', pdfPath);
        obj.setAttribute('type', 'application/pdf');
        obj.setAttribute('width', '100%');
        obj.setAttribute('height', '750px');
        obj.style.display = 'none'; // Hide initially
        
        // Add fallback message inside object
        const fallbackDiv = document.createElement('div');
        fallbackDiv.style.padding = '20px';
        fallbackDiv.style.textAlign = 'center';
        fallbackDiv.style.backgroundColor = '#f8f9fa';
        fallbackDiv.style.border = '1px solid #dee2e6';
        fallbackDiv.style.borderRadius = '5px';
        
        const fallbackMsg = document.createElement('p');
        fallbackMsg.innerHTML = '<strong>Votre navigateur ne prend pas en charge l\'affichage des PDF.</strong>';
        
        const pdfLink = document.createElement('a');
        pdfLink.setAttribute('href', pdfPath);
        pdfLink.setAttribute('target', '_blank');
        pdfLink.setAttribute('class', 'pdf-button view-button');
        pdfLink.style.display = 'inline-block';
        pdfLink.style.margin = '10px';
        pdfLink.textContent = 'Ouvrir le PDF dans un nouvel onglet';
        
        const pdfDownload = document.createElement('a');
        pdfDownload.setAttribute('href', pdfPath);
        pdfDownload.setAttribute('download', '');
        pdfDownload.setAttribute('class', 'pdf-button download-button');
        pdfDownload.style.display = 'inline-block';
        pdfDownload.style.margin = '10px';
        pdfDownload.textContent = 'Télécharger le PDF';
        
        fallbackDiv.appendChild(fallbackMsg);
        fallbackDiv.appendChild(pdfLink);
        fallbackDiv.appendChild(pdfDownload);
        
        obj.appendChild(fallbackDiv);
        frame.parentNode.insertBefore(obj, frame.nextSibling);
        
        // Check PDF loading
        frame.onload = function() {
            loadingMessage.style.display = 'none';
        };
        
        // Check for mobile devices or browsers without PDF support
        if (isMobileDevice() || !isPdfViewingSupported()) {
            frame.style.display = 'none';
            obj.style.display = 'block';
        }
        
        // Add error handling
        frame.onerror = function() {
            frame.style.display = 'none';
            obj.style.display = 'block';
            loadingMessage.style.display = 'none';
        };
    });
});
