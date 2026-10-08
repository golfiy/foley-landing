# Foley – landing (homepage_10.7)

HTML-прототип всей страницы из Figma: [1595 – Start Stream, page 8, `homepage_10.7`](https://www.figma.com/design/Dvi1gBhoXvurjb74BzXcKg/1595---Start-Stream?node-id=1157-9964) (node `1157:9964`).
Без сборки и зависимостей: `index.html` + `styles.css` + `stages.css` + `app.js` + `stages.js`.

```bash
python3 -m http.server 4965 --bind 127.0.0.1 --directory /Users/pc-38/Claude/foley-landing
```

Только локально, без remote (как остальные Foley-прототипы).

## Что анимируется

| Секция | Поведение |
|---|---|
| **Header** | sticky, после 8px скролла – тень; тонкая зелёная полоса прогресса страницы; активный пункт меню подчёркивается по текущей секции; якоря плавно скроллят с учётом высоты хедера |
| **Hero** | Интро: буквы «Onboard» выезжают из маски, строки заголовка за ними, затем lead, CTA и степпер. Плитки 6×4 «собираются волной» |
| | **Смена кадров**: 3 сцены (Hire / Onboard / Monitor) из тех же плиток 156px. Каждая плитка переключает свой кусок фото с диагональной задержкой; одновременно слово в заголовке катится как одометр (Onboard → Monitor → Hire …). Автоплей 6s, прогресс в степпере, клик/стрелки ←/→ переключают |
| | Пауза: hover на плитках, фокус в степпере, вкладка скрыта, hero вне экрана. Hover по плитке подсвечивает её, сетка слегка следует за курсором (parallax), при скролле hero уходит вверх и гаснет, фон/точки/плитки движутся с разной скоростью |
| **Logos** | Бесконечная лента (пауза на hover, затухание по краям), счётчик 0 → 50,000 при появлении |
| **Platform (stages)** | Панель «раскрывается шторкой» при входе в экран; при первом показе один раз сама проигрывает hover-состояния Hire → Onboard → Monitor → Insights (отменяется при любом касании). Дальше – компонент из [`foley-stages`](../foley-stages) без изменений |
| **Snapshot** | Один скриншот Dash, три «камеры»: Overview / Insights-FMCSA (зум на сайдбар) / Navigator (зум на explainer). Автоперелистывание 6s с прогресс-линией, пауза на hover/focus, клик и ↑/↓ переключают |
| **Teams** | Фото с parallax и `scale`, который растёт ровно настолько, насколько нужно сдвигу (в центре экрана кадр 1:1); строки: «шторка» фона слева направо, иконка и стрелка сдвигаются |
| **Guidance** | Заголовок по словам из маски, карточки каскадом; зелёный квадрат на hover вытягивается в полоску; строка про Navigator AI один раз «проливается» градиентом |
| **Cases** | Карусель 2-up: стрелки, drag/swipe, ←/→ на фокусе; на мобиле 1-up |
| **Guides** | Каскад карточек, hover как в Guidance |
| **CTA band** | Фото с parallax, заголовок по словам, кнопки |
| **Footer** | Колонки каскадом, подчёркивание ссылок растёт слева |
| **Кнопки** | Заливка hover «заезжает» слева, стрелка сдвигается на 4px; outline-кнопка инвертируется |

Все блоки с `data-reveal` / `data-split` появляются один раз при входе в экран.

## Режимы для ревью

| Параметр | Что делает |
|---|---|
| `.` (клавиша) | Demo panel: сцена hero (Hire / Onboard / Monitor), тип перехода (Wave / Flip / Fade), автоплей On/Off, скорость ×1 / ×4 |
| `?panel` | Открыть demo panel сразу |
| `?shot` | Статичный кадр без анимаций (для pixel-diff с Figma); `?shot=hire` / `onboard` / `monitor` / `insights` дополнительно фиксирует hover-состояние stages |
| `?slow=6` | Замедлить все переходы в N раз |
| `?fx=flip` | Тип перехода hero при загрузке (`wave`, `flip`, `fade`) |

`prefers-reduced-motion`: без интро, parallax, автоплея и ленты; hero переключается мягким fade только по клику.

## Сверка с макетом

Headless Chrome 1440 vs `get_screenshot` каждого фрейма (`?shot`). Разметка совпадает в пределах 1–3px по вертикали (документ 8241px против 8244px в Figma); mean abs diff по секциям 2–8 из 255 (разница – антиалиасинг текста). Исключение – CTA band (см. ниже, фото не растянуто).

Hero и stages собраны 1:1 (плитки 156px с шагом 157px, маски фото, 4% подложки; stages – из `foley-stages`). Ниже 1440px hero масштабируется через `zoom`, остальные секции – flex/grid.

## Допущения и отличия от макета

- **Hero, сцены и слово**: в Figma есть только кадр Onboard. Сцены Hire и Monitor, цикл слова и степпер добавлены мной (в макете их нет). Сцена Onboard – ровно макетная. Чтобы отключить цикл слова, достаточно оставить одну сцену в `SCENES` (app.js)
- **Watermark**: на фото скорой в макете виден зеркальный Getty Images (Credit: LeoPatrizi). Оставил как в макете, но для продакшена нужен лицензионный кадр
- **CTA band**: в макете фото растянуто примерно на 44% по вертикали (2000×1334 в 1440×668). Здесь оно сохраняет пропорции, прижато вправо и растворяется в тёмной левой части
- **Cases**: в макете 2 карточки, но есть стрелки. Добавил 2 заглушки (Logo / Industry / lorem), чтобы карусель работала. Реальных цитат не выдумывал
- **Snapshot**: в макете один скриншот и lorem-текст. Lorem оставлен как есть, три состояния сделаны «камерой» по одному кадру. Если будут отдельные скриншоты под Insights-FMCSA и Navigator, нужно заменить `data-focus` на `src`
- **Em dash** в тексте макета заменён на «–» (правило «без длинных тире»)
- **Логотипы** Koppers / LDI / Clutter перекрашены в тот же тёмно-синий `#00121e`, что и остальные (в исходниках Figma они синие, цвет задаётся оверлеем)
- Ширины панелей в Figma плавают (1356 / 1360 / 1362), здесь везде единая 1360 (1440 – 2×40)
- Ссылки – заглушки (`#...`), меню: Dash Platform → #platform, Why Foley → #teams, Resources → #resources, Pricing → #contact

## Файлы

- `index.html` – разметка всех секций (stages вставлены из `foley-stages`)
- `styles.css` – токены, секции, адаптив (960 / 1200), reduced motion, demo panel
- `stages.css`, `stages.js` – секция Hire / Onboard / Monitor + Insights (hover / focus / tap, `FoleyStages.hint()`)
- `app.js` – hero-сцены, scroll engine, reveals, snapshot, carousel, demo panel
- `assets/hero/scenes/*.webp` – три сцены 1882×1254 с альфой, собраны из фото в staircase-маски Figma
- `assets/hero/*.svg|jpg` – halftone, маски, исходные фото сцены Onboard

Шрифт: локальный **Inter Display** (как в макете), фолбэк – Google Fonts Inter с `opsz 32`.

## Фото (Unsplash License) – сцены Hire и Monitor

| Сцена | Кадр | Автор | Источник |
|---|---|---|---|
| Hire | transportation | [Josiah Farrow](https://unsplash.com/@josiahfarrow) | https://unsplash.com/photos/ucuOscdCaO4 |
| Hire | construction | [Brian J. Tromp](https://unsplash.com/@brianjtromp) | https://unsplash.com/photos/5eiOsDJnlE4 |
| Hire | manufacturing | [Spencer Davis](https://unsplash.com/@spencerdavis) | https://unsplash.com/photos/a_4tgP1t6Y0 |
| Monitor | utilities | [American Public Power Association](https://unsplash.com/@publicpowerorg) | https://unsplash.com/photos/fHLdXfURDhA |
| Monitor | retail | [KAZEM HUSSEIN](https://unsplash.com/@kazem_hu) | https://unsplash.com/photos/Kq1ERpkH0eQ |
| Monitor | recycling | [James Day](https://unsplash.com/@jamesday) | https://unsplash.com/photos/ECyvZuZeLGc |
