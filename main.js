// 合併現有<script>區塊所有內容至此
document.addEventListener('DOMContentLoaded', () => {
    // 統一初始化入口
    initBannerSystem();
});

function initBannerSystem() {
    // 新版預載機制
    const preloadCarouselImages = () => {
        const slides = document.querySelectorAll('.banner-slide');
        const loadPromises = [];

        slides.forEach((slide, index) => {
            const img = new Image();
            img.src = slide.dataset.src;
            
            // 動態設定srcset
            if(slide.dataset.srcset) {
                img.srcset = slide.dataset.srcset;
            }

            const loadPromise = new Promise((resolve, reject) => {
                img.onload = () => {
                    slide.style.backgroundImage = `url('${img.src}')`;
                    slide.style.backgroundSize = 'cover';
                    slide.style.backgroundPosition = 'center';
                    resolve();
                };
                img.onerror = reject;
            });

            loadPromises.push(loadPromise);
        });

        return Promise.all(loadPromises);
    };

    // 增強型輪播控制
    function initCarousel() {
        let currentIndex = 0;
        const slides = document.querySelectorAll('.banner-slide');
        const transitionTime = 5000; // 5秒切換
        let isTransitioning = false;

        async function showNextSlide() {
            if(isTransitioning) return;
            isTransitioning = true;
            
            const currentSlide = slides[currentIndex];
            currentSlide.style.opacity = 0;
            
            await new Promise(r => setTimeout(r, 800));
            
            currentSlide.classList.remove('active');
            currentIndex = (currentIndex + 1) % slides.length;
            const nextSlide = slides[currentIndex];
            
            nextSlide.classList.add('active');
            nextSlide.style.opacity = 1;
            
            isTransitioning = false;
        }

        // 自動輪播控制
        let slideInterval = setInterval(showNextSlide, transitionTime);

        // 互動控制
        const mainBanner = document.querySelector('.main-banner');
        mainBanner.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
            mainBanner.style.cursor = 'pointer';
        });
        
        mainBanner.addEventListener('mouseleave', () => {
            slideInterval = setInterval(showNextSlide, transitionTime);
            mainBanner.style.cursor = 'default';
        });

        // 初始顯示
        slides[0].style.opacity = 1;
    }

    // 啟動流程
    preloadCarouselImages()
        .then(() => {
            console.log('全尺寸圖片預載完成');
            initCarousel();
        })
        .catch(error => {
            console.error('圖片載入異常:', error);
            document.querySelector('.main-banner').style.background = 
              'linear-gradient(135deg, #3b82f6, #2b6cb0)';
        });
}

// 移除重複的DOMContentLoaded監聽器

// 修改現有輪播初始化邏輯為獨立函式
function initCarousel() {
    let currentIndex = 0;
    const slides = document.querySelectorAll('.banner-slide');
    
    const showNextSlide = () => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    };

    // 保留原有輪播控制邏輯
    let slideInterval = setInterval(showNextSlide, 5000);

    const mainBanner = document.querySelector('.main-banner');
    mainBanner.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    mainBanner.addEventListener('mouseleave', () => {
        slideInterval = setInterval(showNextSlide, 5000);
    });
}

// 現有函式定義... 

// 移除錯誤的HTML標籤，保留純JavaScript代碼
document.addEventListener('DOMContentLoaded', () => {
    // 初始化程式碼...

    const banner = document.querySelector('.main-banner');
    const img = new Image();

    img.src = 'https://i.ibb.co/BKvqDx4H/1.jpg';
    img.decode().then(() => {
        console.log('圖片尺寸:', img.width + 'x' + img.height);
        banner.style.backgroundImage = `url('${this.src}')`;
        banner.classList.add('loaded');
    }).catch((error) => {
        console.error('圖片載入錯誤:', error);
        banner.style.backgroundImage = 'linear-gradient(135deg, #3b82f6, #2b6cb0)';
    });
});

// 其他函式定義... 