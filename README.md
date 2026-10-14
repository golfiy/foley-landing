# Foley – landing v2 (homepage + navigation)

HTML-прототип всей страницы из Figma: [1595 – Start Stream, page 8](https://www.figma.com/design/Dvi1gBhoXvurjb74BzXcKg/1595---Start-Stream?node-id=1140-9359):
`homepage` (1195:12173), `navigation` (1195:17678, 4 мега-меню), `how_it_works hover states` (1195:12266).
Без сборки и зависимостей: `index.html` + `styles.css` + `stages.css` + `app.js` + `stages.js`.

```bash
python3 -m http.server 4965 --bind 127.0.0.1 --directory /Users/pc-38/Claude/foley-landing
```

Только локально, без remote (как остальные Foley-прототипы). Предыдущая версия (макет `homepage_10.7`) – git tag `v1-homepage-10.7`.

## Что поменялось в v2 (по новому макету)

| Блок | v1 → v2 |
|---|---|
| Сетка | поля 40 → **80px**, контент 1360 → **1280** |
| Шапка | одна строка → **info-bar** (Search, телефон; уезжает при скролле) + **main bar** (Products / Solutions / Resources / Company с шевронами, Pricing, Log in, Request a demo; липкая) |
| Навигация | новое: **4 мега-меню** (колонки, промо-карточка, нижняя полоса ссылок) |
| Кнопки | 44px-стрелка → **24px-стрелка**, 18/20 SemiBold, `pl24 pr16 py14` |
| Hero | display 116/120, h1 60/64, лид шире (496), контент центрирован по вертикали; **новое фото скорой** (без watermark) |
| Логотипы | PNG → **SVG mono** 48px, gap 64, маски 48px по краям |
| How it works | колонки 420 → **400** с рамками; hover: ссылка **превращается в белую кнопку** под подзаголовком, ниже 4 ссылки со стрелками; Insights: иконка AI, градиент темнее в hover |
| Snapshot | левая колонка 433, картинка в панели с отступом 64, CTA «Get Demo» |
| Teams | новое фото и кроп, иконки 24, текст 18px |
| What to do next | заголовок с переносом, карточки с правой границей |
| Testimonials | карточки 522 с зазором 20, стрелки снаружи, Clutter + Koppers |
| FAQ | зазор 20, во всех карточках «Read case study» |
| Banner | 688px, тень сильнее (0.88 / 0.74), CTA 52px |
| Футер | полностью новый: 3 короткие колонки + CTA, 4 стека ссылок, адрес, бейджи BBB / PBSA, соцсети |

## Что анимируется

| Блок | Поведение |
|---|---|
| **Шапка** | info-bar уезжает, main bar липкий с тенью |
| **Мега-меню** | hover-intent 120ms (между пунктами 60ms), «шторка» сверху, колонки и промо въезжают каскадом; при переключении меню контент уезжает в сторону направления (старый уходит за 110ms, новый приходит после, тексты не накладываются); шеврон поворачивается, пункт подчёркнут |
| | закрытие: увод курсора (220ms), клик вне, Esc (фокус возвращается на пункт), скролл > 60px, клик по ссылке. Клавиатура: ↓ на пункте открывает меню и фокусирует первую ссылку; скрытые панели `inert` |
| **Hero** | интро, плитки 6×4 «волной» меняют сцены Hire / Onboard / Monitor, слово катится одометром, автосмена каждые 6s (без видимого степпера), пауза на hover / скрытой вкладке / вне экрана, parallax |
| **Логотипы** | бесконечная лента без hover-эффектов; счётчик 0 → 50,000 |
| **How it works** | панель раскрывается «шторкой»; при первом показе один раз проигрывает hover-состояния (отменяется любым касанием); hover: текстовая ссылка морфится в кнопку (padding + плашка), иллюстрация уходит, ссылки въезжают каскадом |
| **Snapshot** | три «камеры» по одному скриншоту, автоперелистывание 6s без полосы прогресса, пауза на hover / фокусе |
| **Teams** | фото с parallax, строки: «шторка» фона, сдвигается только стрелка (иконка стоит) |
| **Testimonials** | карусель: стрелки, drag / swipe, ←/→ |
| **Мобильное меню** | бургер → drawer с аккордеонами (`<details>`), блокирует скролл страницы |

## Режимы для ревью

| Параметр | Что делает |
|---|---|
| `.` (клавиша) | Demo panel: сцена hero, переход (Wave / Flip / Fade), **мега-меню** (Closed / Products / Solutions / Resources / Company), автоплей, скорость |
| `?panel` | Открыть demo panel сразу |
| `?shot` | Статичный кадр без анимаций (для pixel-diff); первая строка Teams в hover, как в макете |
| `?shot=hire` / `onboard` / `monitor` / `insights` | + зафиксировать hover-состояние одной колонки |
| `?shot=all` | все колонки how it works в hover = фрейм «how_it_works hover states» |
| `?menu=products` | открыть мега-меню при загрузке (`solutions`, `resources`, `company`) |
| `?slow=6`, `?fx=flip` | замедлить переходы / тип перехода hero |

## Сверка с макетом

Headless Chrome 1440 (`?shot`) против `get_screenshot` фреймов. Все секции совпадают по высоте в пределах 1px (футер −4px), mean abs diff 1–4 из 255 (антиалиасинг текста). Отдельно сверены: hover-фрейм how it works (4.2), 4 мега-меню (5–8), hero по строкам текста (±1px).

Что пришлось подобрать по замерам:
- **letter-spacing** в токенах Figma задан в процентах: display −3% (−3.48px), h1 −2% (−1.2px)
- **переносы**: Figma использует `text-wrap: pretty` → здесь `text-wrap-style: pretty` (longhand, чтобы не ломать `nowrap` в мини-карточках)
- иллюстрации в колонках не масштабируются, а **сужаются до 336px** при той же высоте 269
- в «See what matters. / Know what to do next.» в макете принудительный перенос

## Допущения и отличия от макета

- **Hero**: сцены Hire / Monitor и цикл слова – моя добавка (в Figma только кадр Onboard); степпер убран по ревью
- **Banner**: в макете фото 1024×683 растянуто в 1440×688; здесь пропорции сохранены (взят исходник 2000px), фото прижато вправо и растворяется в тёмной левой части – единственная секция с заметным pixel-diff
- **Testimonials**: стрелки есть, карточек 2 → добавлены 2 заглушки (Logo / Industry / lorem), реальных цитат не выдумывал
- **Snapshot**: один скриншот и lorem из макета; три состояния – «камера» по одному кадру
- В Insights в макете «Alerts & notifications →» содержит и символ «→», и иконку – оставил только иконку
- **Мобильная навигация** в макете не нарисована – сделал drawer с аккордеонами
- Em dash в текстах заменён на «–»; ссылки – заглушки (`#...`)
- Search в info-bar – только кнопка без поиска

## Файлы

- `index.html` – разметка: шапка + мега-меню + drawer, секции, футер
- `styles.css` – токены (Figma variables), кнопки, шапка/меню, hero, секции, адаптив (1279 / 1139 / 959), reduced motion, demo panel
- `stages.css`, `stages.js` – how it works (state machine, морф CTA, `FoleyStages.hint()`, `?shot=all`)
- `app.js` – мега-меню, drawer, hero-сцены, reveals, scroll engine, snapshot, карусель, demo panel
- `assets/v2/` – ассеты нового макета (иконки 24px, логотипы SVG, фото, промо мега-меню, бейджи, соцсети)
- `ref/` (в .gitignore) – референсы Figma, сравнения, `ref/tools/` – CDP-скрипты сверки (`capture.mjs`, `diff2.py`, `panel.mjs`, `menu.mjs`, `menu-motion.mjs`)

Шрифт: локальный **Inter Display**, фолбэк – Google Fonts Inter с `opsz 32`.

## Фото (Unsplash License) – сцены Hire и Monitor

| Сцена | Кадр | Автор | Источник |
|---|---|---|---|
| Hire | transportation | [Josiah Farrow](https://unsplash.com/@josiahfarrow) | https://unsplash.com/photos/ucuOscdCaO4 |
| Hire | construction | [Brian J. Tromp](https://unsplash.com/@brianjtromp) | https://unsplash.com/photos/5eiOsDJnlE4 |
| Hire | manufacturing | [Spencer Davis](https://unsplash.com/@spencerdavis) | https://unsplash.com/photos/a_4tgP1t6Y0 |
| Monitor | utilities | [American Public Power Association](https://unsplash.com/@publicpowerorg) | https://unsplash.com/photos/fHLdXfURDhA |
| Monitor | retail | [KAZEM HUSSEIN](https://unsplash.com/@kazem_hu) | https://unsplash.com/photos/Kq1ERpkH0eQ |
| Monitor | recycling | [James Day](https://unsplash.com/@jamesday) | https://unsplash.com/photos/ECyvZuZeLGc |

## Правки по ревью (2026-10-14)

Убрано: степпер под hero (полоски + подписи), зелёная полоса прогресса в Snapshot, зелёная полоса прокрутки в шапке, зелёное свечение AI-бейджа в hover, рост зелёных квадратов в hover (What to do next, FAQ). Автосмена hero и ротация Snapshot теперь на таймере с паузой.
Добавлено: у логотипов убран hover (затемнение, приглушение соседей, пауза ленты); в строках Teams на hover двигается только стрелка.
Блок What to do next: hover у карточек убран полностью.
