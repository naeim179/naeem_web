// ====== Mobile Navbar Toggle ======
(function () {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  const body = document.body;

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      body.classList.toggle('nav-open');
    });

    // لما المستخدم يضغط على أي لينك بالمينيو في الموبايل، نسكرها
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 840) {
          body.classList.remove('nav-open');
        }
      });
    });
  }
})();

// ====== Loader Logic ======
(function () {
  const loader = document.getElementById('loader');

  if (!loader) return;

  // نخليه يبين شوي وبعدين يختفي
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loader-hide');
      // بعد الأنيميشن نشيله من الـ DOM
      setTimeout(() => {
        if (loader && loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, 600);
    }, 1200); // 1.2 ثانية قبل الإخفاء
  });
})();
