document.addEventListener('DOMContentLoaded', function() {
    const modelSelect = document.getElementById('model-select');
    const modelIframe = document.getElementById('model-iframe');

    modelSelect.addEventListener('change', function() {
        const selectedUrl = this.value;
        if (selectedUrl) {
            modelIframe.src = selectedUrl;
        } else {
            modelIframe.src = 'about:blank'; // Clears the iframe if no model is selected
        }
    });
});