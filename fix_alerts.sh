sed -i 's/alert(/customAlert(/g' js/admin.js

cat << 'INNER_EOF' >> js/admin.js

window.customAlert = function(msg) {
    const alertDiv = document.createElement('div');
    alertDiv.textContent = msg;
    alertDiv.style.position = 'fixed';
    alertDiv.style.bottom = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.background = '#0F172A';
    alertDiv.style.color = '#FFF';
    alertDiv.style.padding = '12px 24px';
    alertDiv.style.borderRadius = '8px';
    alertDiv.style.zIndex = '10000';
    alertDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
};
INNER_EOF
