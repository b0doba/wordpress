document.addEventListener('DOMContentLoaded', function () {
  const input = document.querySelector('.search-container input[name="s"]');
  if (!input) return;

  const suggestionBox = document.createElement('div');
  suggestionBox.classList.add('autocomplete-suggestions');
  input.parentNode.appendChild(suggestionBox);

    input.addEventListener('input', function () {
    const query = input.value.trim();

    if (query.length < 3) {
      suggestionBox.innerHTML = '';
      suggestionBox.style.display = 'none'; // ← itt rejtjük el
      return;
    }

    fetch('/wp-admin/admin-ajax.php?action=szak_kereso_elo&q=' + encodeURIComponent(query))
      .then(res => res.json())
      .then(data => {
        suggestionBox.innerHTML = '';

        if (data.length === 0) {
          suggestionBox.style.display = 'none'; // ← nincs találat = rejtve
          return;
        }

        data.forEach(item => {
          const el = document.createElement('div');
          el.classList.add('autocomplete-item');
          el.textContent = item.title;
          el.addEventListener('click', () => {
        input.value = item.title;
        suggestionBox.innerHTML = '';
        suggestionBox.style.display = 'none';
      });
          suggestionBox.appendChild(el);
        });

        suggestionBox.style.display = 'block'; // ← van találat = megjelenik
      });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.szak-kereso-form');
  const input = document.querySelector('.search-container input[name="s"]');
  const kepzesSelect = document.querySelector('select[name="kepzestipus"]');
  const szakteruletSelect = document.querySelector('select[name="szakterulet"]');

  // Form elküldésekor: vizsgáljuk a pontos egyezést
  form.addEventListener('submit', function (e) {
    const keresett = input?.value.trim().toLowerCase();
    const kepzes = kepzesSelect.value;
    const szakterulet = szakteruletSelect.value;

    // Ha nincs beírva semmi → mehet a szűréses redirect logika
    if (!keresett && (kepzes || szakterulet)) {
      e.preventDefault();
      let url = '';
      if (kepzes) {
        url = `/kepzestipus/${encodeURIComponent(kepzes)}/`;
      } else if (szakterulet) {
        url = `/szakterulet/${encodeURIComponent(szakterulet)}/`;
      }
      window.location.href = url;
      return;
    }

    // Ha van keresett szöveg → lekérdezzük AJAX-szal
    if (keresett) {
      e.preventDefault(); // először leállítjuk a form küldését

      fetch('/wp-admin/admin-ajax.php?action=szak_kereso_elo&q=' + encodeURIComponent(keresett))
        .then(res => res.json())
        .then(data => {
          if (!data.length) {
            form.submit(); // nincs találat → hagyjuk a formot menni
            return;
          }

          // Egyezés keresése
          const exactMatch = data.find(item => item.title.toLowerCase() === keresett);

          if (exactMatch || data.length === 1) {
            const redirectTo = exactMatch?.url || data[0].url;
            window.location.href = redirectTo;
          } else {
            form.submit(); // ha több találat, de nincs pontos egyezés
          }
        });
    }
  });
});

window.addEventListener('pageshow', () => {
  const input = document.querySelector('.search-container input[name="s"]');
  const kepzes = document.querySelector('select[name="kepzestipus"]');
  const szakterulet = document.querySelector('select[name="szakterulet"]');

  if (input) input.value = '';
  if (kepzes) kepzes.selectedIndex = 0;
  if (szakterulet) szakterulet.selectedIndex = 0;
});


document.addEventListener('DOMContentLoaded', function () {
  const input = document.querySelector('.search-container input[name="s"]');
  const kepzesSelect = document.querySelector('select[name="kepzestipus"]');
  const szakteruletSelect = document.querySelector('select[name="szakterulet"]');

  function frissitAllapot() {
    const kepzesVan = kepzesSelect.value !== '';
    const szakteruletVan = szakteruletSelect.value !== '';

      if ((kepzesVan || szakteruletVan) && input.value !== '') {
        input.value = '';
      }

    // Ha bármelyik selectben van érték → tiltsuk le az inputot
    if (kepzesVan || szakteruletVan) {
      input.disabled = true;
      input.placeholder = 'Keresés szűrővel... ';
    } else {
      input.disabled = false;
      input.placeholder = 'Keress egy szak nevére...';
    }

    // Kiemelés osztály a selectekhez
    kepzesSelect.classList.toggle('active', kepzesVan);
    szakteruletSelect.classList.toggle('active', szakteruletVan);
  }

  // Kezdeti állapot beállítása
  window.addEventListener('pageshow', () => {
    frissitAllapot();
  });

  // Változás figyelése
  kepzesSelect.addEventListener('change', frissitAllapot);
  szakteruletSelect.addEventListener('change', frissitAllapot);
});