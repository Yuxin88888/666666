const requiredFiles = [
    'assets/css/main.css',
    'assets/js/main.js',
    'assets/images/logo.png',
    'assets/images/social-icons/facebook.png',
    'assets/images/social-icons/line.png'
];

function validateStructure() {
    requiredFiles.forEach(file => {
        fetch(file)
            .then(res => 
                console.log(`${file}: ${res.ok ? '✅存在' : '❌缺失'}`)
            )
            .catch(() => 
                console.log(`${file}: ❌無法載入`)
            );
    });
}
validateStructure(); 