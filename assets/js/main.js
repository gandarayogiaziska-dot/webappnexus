const supabaseUrl = "https://mrhiptnzoehrueolbpdm.supabase.co";
const supabaseAnonKey = "sb_publishable_pLpXV7Q6Y9RUZUjRcYKbGA_xhK1OjLB";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

async function loadBannerHTML() {
  const res = await fetch('components/banner.html');
  const html = await res.text();
  document.getElementById('banner-container').innerHTML = html;
}

// pastikan supabaseClient sudah di-inisialisasi

async function loadBanners() {
  const { data, error } = await supabaseClient
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  if (!data || data.length === 0) return;

  const container = document.getElementById('banner-container');
  container.innerHTML = `
    <div class="swiper">
      <div class="swiper-wrapper"></div>
      <div class="swiper-pagination"></div>
      <div class="swiper-button-next"></div>
      <div class="swiper-button-prev"></div>
    </div>
  `;

  const wrapper = container.querySelector('.swiper-wrapper');

  data.forEach(banner => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');

    if (banner.vidio_url) {
      const video = document.createElement('video');
      video.src = banner.vidio_url;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      slide.appendChild(video);
    } else if (banner.img_url) {
      const img = document.createElement('img');
      img.src = banner.img_url;
      img.alt = banner.title || "Banner";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      slide.appendChild(img);
    } else {
      slide.textContent = banner.title;
      slide.style.color = "#fff";
      slide.style.fontSize = "24px";
      slide.style.textAlign = "center";
      slide.style.display = "flex";
      slide.style.alignItems = "center";
      slide.style.justifyContent = "center";
      slide.style.background = "#333";
      slide.style.height = "100%";
    }

    wrapper.appendChild(slide);
  });

  // Init Swiper
  new Swiper('.swiper', {
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  });
}

// Panggil banner
loadBanners();

// Load featured games dari Supabase
// Load featured games dari Supabase
async function loadFeaturedGames() {
  const { data, error } = await supabaseClient
    .from('games')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById('featured-grid');
  container.innerHTML = ""; // kosongkan dulu

  data.forEach(game => {
    const card = document.createElement('div');
    card.classList.add('game-card');

    // tombol hanya aktif jika is_featured = true
    const isActive = game.is_featured;

    card.innerHTML = `
      <div class="game-image">
        <img src="${game.image_url}" alt="${game.name}">
        <div class="game-tag">Featured</div>
      </div>
      <div class="game-content">
        <div class="game-title">${game.name}</div>
        <div class="game-desc">${game.description}</div>
        <a href="${isActive ? '/games/' + game.slug : '#'}" 
           class="game-btn" 
           style="${!isActive ? 'pointer-events:none;opacity:0.5;' : ''}">
           COMING SOON
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

// Panggil function
loadFeaturedGames();


// Load Categories
async function loadCategories() {
  const { data, error } = await supabaseClient
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return console.error(error);

  const container = document.querySelector('.category-list');
  container.innerHTML = "";

  data.forEach(category => {
    const a = document.createElement('a');
    a.href = "#";
    a.className = 'category-item';
    a.innerHTML = `<img src="${category.image_url}" alt="${category.name}"><span>${category.name}</span>`;
    a.addEventListener('click', e => {
      e.preventDefault();
      loadProducts(category.id);
    });
    container.appendChild(a);
  });
}

// Load Products
async function loadProducts(categoryId = null) {
  let query = supabaseClient.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  const container = document.getElementById('product-container');
  container.innerHTML = "";

  if (error) return console.error(error);

  if (!data || data.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;font-size:18px;color:#555;">Product tidak tersedia saat ini</div>`;
    return;
  }

  data.forEach((p, i) => {
    const card = document.createElement('a');
    card.href = "#"; // tombol hapus, jadi link tidak dipakai
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb">
        ${p.old_price && p.old_price > p.price ? `<span class="discount-badge">${Math.round((1 - p.price/p.old_price)*100)}%</span>` : ''}
        <img src="${p.image_url}" alt="${p.title}">
      </div>
      <div class="product-info">
        <h3 class="product-title">${p.title}</h3>
        <div class="product-category">${p.product_type || ''}</div>
        <div class="product-price">
          ${p.old_price ? `<span class="old-price">Rp${p.old_price.toLocaleString()}</span>` : ''}
          <span class="new-price">Rp${p.price.toLocaleString()}</span>
        </div>
        <div class="product-meta">
          <span>${p.total_sold || 0} terjual</span>
          <span>⭐ ${p.rating || 0}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
    setTimeout(() => card.classList.add('show'), i*100);
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts(); // tampil semua product awal
});

//// team
 async function loadTeam() {
  const { data, error } = await supabaseClient
    .from('team')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching team:', error);
    return;
  }

  const container = document.getElementById('teamContainer');
  if (!container) {
    console.error('teamContainer tidak ditemukan!');
    return;
  }

  container.innerHTML = ""; // kosongkan dulu

  data.forEach(member => {
    const card = document.createElement('div');
    card.classList.add('team-card');
    card.innerHTML = `
      <img src="${member.image_url}" alt="${member.name}">
      <h3>${member.name}</h3>
      <p>${member.role}</p>
    `;
    container.appendChild(card);
  });
}

// Panggil loadTeam setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
  loadTeam();
});
const music = document.getElementById('bgMusic');
const toggleBtn = document.getElementById('toggleMusicBtn');

// Klik tombol → toggle play / pause
toggleBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play(); // mulai musik
  } else {
    music.pause(); // pause musik
  }
});

// Event listener → update teks tombol sesuai status musik
music.addEventListener('play', () => {
  toggleBtn.textContent = "⏸ Pause Musik";
});

music.addEventListener('pause', () => {
  toggleBtn.textContent = "▶ Play Musik";
});


 




