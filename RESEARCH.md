# Ресёрч: как устроены трекеры здоровья и что из этого взять для Misha Health Tracker

Обзор по существующим приложениям (для питомцев и для людей с хроническими болезнями),
ветеринарным рекомендациям по домашнему наблюдению и по тому, как такие приложения строят
технически. В конце — что у нас уже совпало и что стоит добавить.

Дата: 07.09.2026.

---

## 1. Рынок: три семьи приложений

| Семья | Примеры | Чем занимаются | Как относятся к симптомам |
|---|---|---|---|
| **Карты здоровья питомца** | 11pets, PetVitality, DogPulse, Petfetti, Pet Care Tracker (Dog Cat Log) | Учёт: прививки, дегельминтизация, вес, лекарства с напоминаниями, визиты, документы (снимки, анализы, кровь), гигиена, питание | Вторично — обычно свободная «заметка» или тег к дню |
| **Питомцевые с ИИ-аналитикой** | PerkyPet AI и подобные | Ищут скрытые паттерны: анализируют до 90 дней логов — спад аппетита, энергии, повторяющиеся симптомы | Ядро продукта, но через «много данных + тренды», а не через правила |
| **Человеческие симптом-трекеры при хронике** | Bearable, Human Health, CFS Tracker, Symptom Tracker | Симптомы + лекарства + триггеры + сон/стресс/активность; «насколько симптом мешал жить»; заметка-контекст | Ядро; самый зрелый UX |

**Вывод.** Misha Health Tracker ближе всего к третьей семье (симптом-дневник при хронике),
но с двумя отличиями, которых у аналогов почти нет: (1) всё сравнивается с **личной нормой**
конкретной собаки, (2) сознательно **не-алармистская** подача. Это наши сильные стороны — их стоит держать.

---

## 2. Канонический набор записей

Свод из ветеринарных источников (Vetster, Veterinary Partner/VIN, AKC, BluePearl) и из фич-листов
приложений (11pets, PetVitality и др.).

### 2.1. База профиля
- Вид, порода/метис, возраст/дата рождения, вес, пол, фото.
- Хронические диагнозы, аллергии, **запрещённые препараты**.
- Лечащий врач и клиника — **с телефоном** (у нас есть, аналоги часто забывают телефон).

### 2.2. Личная норма (baseline) — то, что вет-источники прямо советуют записать, «пока всё хорошо»
- Аппетит: сколько приёмов в день, допустимые пропуски, обычная порция, лечебная/любимая еда.
- Обычные активность, поведение, режим сна.
- Туалет: обычная частота и вид стула и мочи.
- Походка / привычная хромота.
- **TPR**: температура (норма взрослой собаки ~37,8–39,2 °C), пульс, дыхание в покое.

### 2.3. Ежедневная / плановая проверка
Общее состояние относительно нормы · аппетит и жажда · моча и стул · дёсны (цвет + CRT) ·
дыхание в покое · хромота · рвота/диарея · температура · слабость/шаткость/обмороки · боль.

### 2.4. Лекарства и профилактика
Препарат, действующее вещество, форма, доза, единицы, частота, длительность курса, причина,
кто назначил, противопоказания, заметки. Отметки **«дано / пропущено / отменено врачом»**.
Отдельно: дата следующей обработки от паразитов; прививки и дегельминтизация с авто-напоминанием.

### 2.5. События
- Визит к врачу: причина, дата/время, врач, стоимость, итог (заметка + фото).
- Анализ / снимок: дата, тип, лаборатория, **файл результата**, комментарий врача.
- Укус клеща: дата и место обнаружения/удаления, наполненность, способ удаления, фото клеща и места.
- Травма / особый день («после прогулки»: перегрев, клещ, порез, необычное поведение).

### 2.6. Тренды (графики)
Вес, температура, дыхание в покое. Из них **вес и дыхание в покое** — самые информативные для раннего
выявления ухудшения.

### 2.7. Контекст
Смена корма, переезд, гости, новые животные, поездка, стресс, погода — вписывать **рядом** с симптомом
(во всех человеческих трекерах это отдельное поле «заметка/триггер»).

### 2.8. Медиа
Фото **и видео** симптома. Вет-источники (PetHealthNetwork и др.) особенно просят короткое видео при
кашле, хромоте, рвоте, судорогах, кожных обострениях — «даёт врачу больше, чем любое словесное описание».

---

## 3. Доменные вещи, которые стоит знать

- **«Знай норму своей собаки».** Вет-консенсус: периодически делать «мини-осмотр», когда ничего не
  беспокоит, и записать параметры как персональный baseline; тревожиться надо от **изменения** относительно
  него, а не от абсолютных значений. → это ровно ядро нашего продукта, совпало.
- **Дёсны.** Розовые (лосось / жвачка), влажные — норма. Синюшные, бледные, кирпично-красные, жёлтые,
  пятнистые, кровоточащие — к врачу. **CRT** (время наполнения капилляров): прижать десну пальцем,
  отпустить — цвет должен вернуться **менее чем за 2 секунды**.
- **Дыхание в покое / во сне (SRR).** У здоровой взрослой собаки — **не более 25 вдохов/мин** (обычно
  заметно меньше). При болезни сердца устойчиво **>30** — возможен отёк лёгких, повод к врачу. Считают
  за 15 c ×4 или за минуту, когда собака спокойно спит. Есть отдельные приложения только под это
  (Ceva Cardalis RR — тап по экрану в такт дыханию).
- **Температура.** Норма ~37,8–39,2 °C (100–102,5 °F).
- **HHHHHMM** — шкала качества жизни Villalobos, для хроников и пожилых: **H**urt, **H**unger,
  **H**ydration, **H**ygiene, **H**appiness, **M**obility, **M**ore good days than bad. Каждый пункт 0–10;
  сумма > 35 — приемлемо. Годится как **опциональный «еженедельный»** режим рядом с ежедневной проверкой.
- **Клещ / Лайм.** Характерный признак — «блуждающая» хромота (перескакивает с лапы на лапу). Клиника
  может появиться через **7–21 день** или через **2–5 месяцев**; многие врачи просят сдать **анализ через
  4–6 недель** после снятия клеща. 95 % заражённых собак остаются бессимптомными. → наш 21-дневный
  активный контроль логичен, но стоит добавить веху «анализ через 4–6 недель» и не сворачивать
  наблюдение слишком жёстко ровно на 21-м дне (у нас уже есть «длительное наблюдение до 90 дней» —
  это правильно).

---

## 4. Как такие приложения строят технически

- **Local-first / offline-first PWA** — ровно наш случай. Три слоя: service worker (оболочка + офлайн-режим),
  локальная БД (чтение/запись), синхронизация — опциональна и добавляется потом.
- **Слои хранения:** кэш состояния → **IndexedDB** (практический минимум для данных) → шифрованное
  хранилище / SQLite-WASM (потолок). У нас `localStorage` — приемлемо для объёма «дневник одной собаки»,
  но при росте (много фото/видео) упрётся в ~5 МБ; тогда правильный шаг — переезд на IndexedDB.
- **Разрешение конфликтов** при будущей синхронизации: field-level last-write-wins покрывает большинство
  случаев.
- **Принцип local-first:** данные на устройстве — источник истины, «поделиться» (экспорт, отчёт врачу) —
  осознанное действие пользователя. У нас так и сделано (экспорт/импорт JSON, отчёт).
- **Пуши.** Настоящий web-push без сервера невозможен; системный календарь (`.ics`) под фиксированное
  расписание — рабочая и на iPhone более надёжная замена. У нас уже применено.

---

## 5. UX-уроки из зрелых трекеров

- **Один вопрос на экран**, прогресс-бар, логичная группировка, предсказуемый выход — даёт самую высокую
  вовлечённость. У нас есть.
- **Напоминания:** кастомизируемые и **их должно быть немного**. Перебор уведомлений → усталость и
  отключение. У нас: 2 в день + 1 мягкий повтор — в норме.
- **«Регулярность важнее полноты».** Лучше «сегодня лёгкое отклонение» каждый день, чем идеальный,
  но редкий журнал. → поощрять короткие ежедневные отметки и **не штрафовать за неполные**. У нас статус
  «проверка неполная» без тревоги — это ровно то, что советуют.
- **Лекарства без чувства вины.** При «пропущено» полезно (не обязательно) спросить причину. Реальная
  статистика причин: «забыл(а)» ~30 %, «стало лучше» ~27 %, «закончилось» ~18 %, «стало плохо» ~17 %.
  «Стало лучше/хуже» — это уже сигнал для врача, стоит подсвечивать. Тон — человеческий, без нотаций.
- **Свои симптомы.** Дать пользователю добавлять собственные пункты помимо предложенных.

---

## 6. Отчёт врачу — как делают другие

Одна страница. Таймлайн: когда началось, как менялось. Единый актуальный список всех лекарств,
добавок и профилактики. Контекст (смена рутины). Только изменения — без повтора стабильных дней.
Видео симптомов. Вопросы владельца. → у нас отчёт уже устроен именно так, совпадает.

---

## 7. Риск, который прямо подтверждает нашу философию

Исследования по «киберхондрии»: симптом-чекеры с алгоритмом, склонным выдавать крайние исходы,
**усиливают тревогу**; люди с высокой тревожностью после проверки чувствуют себя хуже, хотя пользуются
такими приложениями чаще. Рекомендации: неалармистский дизайн, прозрачная логика, спокойный язык,
честная оговорка, что подобные инструменты могут повышать тревогу.

Наши решения (жёлтый статус без сирен, сравнение с личной нормой, «единичный пропуск еды — не тревога»,
блок «учтено как его норма», нейтральный статус «проверка неполная») — ровно то, что советуют
исследователи. Стоит добавить в экран «О программе» короткую честную фразу об этом.

---

## 8. Чего у нас нет, а у аналогов есть — кандидаты в бэклог

| Идея | Откуда | Приоритет |
|---|---|---|
| Вес как отдельная регулярная метрика + график | 11pets, вет-источники (вес — ранний маркер) | высокий |
| Прививки и дегельминтизация как тип события с авто-напоминанием | 11pets, PetVitality | высокий |
| Дыхание в покое: счётчик «тап в такт» + порог по SRR (25 / 30) | Cardalis RR, кардиологи Tufts | средний |
| Опциональный недельный режим HHHHHMM для хроника/пожилого | шкала Villalobos, AAHA | средний |
| Веха «анализ через 4–6 недель» в модуле клеща | AMC, MedVet | средний |
| Хранение файлов анализов (PDF / фото документа), не только фото симптома | 11pets | средний |
| Видео-вложения (не только фото) | PetHealthNetwork — врачи особенно просят видео | средний |
| Поле «контекст» (смена корма / рутины / погода) рядом с записью | Bearable, Human Health | низкий |
| Возможность добавлять свои пункты в чек-лист | человеческие трекеры | низкий |
| График температуры (данные уже собираются) | — | низкий, дёшево |
| Переезд с `localStorage` на IndexedDB ради объёма фото/видео | offline-first best practices | по мере роста |

---

## Что уже сделано правильно (не трогать)

- Сравнение с личной нормой как ядро логики.
- Спокойная подача: нет сирен, красных вспышек, «опасности» на жёлтом; блок «учтено как его норма».
- Один вопрос на экран + прогресс; «Не проверяла» на каждом вопросе; нейтральный стат-status.
- Версионирование порогов (`RULES.version` в каждой записи) — этого нет почти ни у кого.
- Отметки лекарств без чувства вины.
- Отчёт врачу: одна страница, только отклонения, вопросы владельца.
- Local-first: данные на устройстве, экспорт — осознанное действие; `.ics` вместо несуществующего пуша.

---

## Источники

**Приложения и обзоры:**
- [PetVitality (App Store)](https://apps.apple.com/us/app/petvitality-pet-care-tracker/id6479165973) · [PetVitality (Google Play)](https://play.google.com/store/apps/details?id=com.lyssa.petvitality)
- [DogPulse (Google Play)](https://play.google.com/store/apps/details?id=com.andre.dogpulse)
- [Petfetti](https://www.petfetti.com/)
- [Pet Care Tracker — Dog Cat Log (App Store)](https://apps.apple.com/us/app/pet-care-tracker-dog-cat-log/id1551003273)
- [Top 5 Pet Wellness Tracking Apps — PerkyPet AI](https://perkypetai.com/tips/the-top-5-pet-wellness-tracking-apps)
- [11pets — Features](https://www.11pets.com/en/feature) · [11pets (App Store)](https://apps.apple.com/us/app/11pets-pet-care/id1232470530)
- [6 Top Dog Health Tracker Apps — Woofz](https://www.woofz.com/blog/6-top-dog-health-tracker-apps/)

**UX симптом-трекеров:**
- [Symptom Tracking in Health Apps: UX/UI Best Practices — Insaim](https://www.insaim.design/healthtech-blog/symptom-tracking-in-health-apps-ux-ui-best-practices)
- [Chronic Illness Symptom Tracker — Human Health](https://www.human.health/features/chronic-illness-symptom-tracker)
- [Bearable](https://bearable.app/)
- [The Complete Guide to Symptom Tracker Apps — Getwellson](https://www.getwellson.com/blog/the-complete-guide-to-symptom-tracker-app)

**Ветеринарное домашнее наблюдение:**
- [Dog health checklist: What is your dog's normal? — Vetster](https://vetster.com/en/wellness/dog-health-checklist-what-is-your-dog-s-normal)
- [Physical Exam Checklist for Pets — Veterinary Partner (VIN)](https://veterinarypartner.vin.com/default.aspx?pid=19239&id=4951314)
- [How to Monitor Your Pet's Vital Signs at Home — BluePearl](https://bluepearlvet.com/pet-blog/monitor-pet-vital-signs/)
- [Keeping a "Pulse" on Your Dog's Vital Signs — Dr. Buzby's ToeGrips](https://toegrips.com/dog-vital-signs-heart-respiratory-rate/)
- [How to Keep Your Dog Healthy — AKC](https://www.akc.org/expert-advice/health/how-to-keep-your-dog-healthy/)

**Дыхание в покое (SRR):**
- [Sleeping and Resting Respiratory Rates of Dogs and Cats with Heart Disease — Veterinary Partner (VIN)](https://veterinarypartner.vin.com/default.aspx?pid=19239&catId=254057&id=8401142)
- [Home Respiratory Rate Monitoring in Dogs & Cats — Clinician's Brief](https://www.cliniciansbrief.com/article/home-respiratory-rate-monitoring-dogs-cats)
- [Monitoring Heart Disease Treatment at Home — Tufts Cummings School](https://vet.tufts.edu/foster-hospital-small-animals/specialty-services/cardiology/heartsmart/heart-disease-treatments/monitoring-heart-disease-treatment-home)
- [Home Breathing Rate Evaluation — VCA](https://vcahospitals.com/know-your-pet/home-breathing-rate-evaluation)

**Качество жизни (HHHHHMM):**
- [How to Assess Your Senior Pet's Quality of Life — AAHA](https://www.aaha.org/resources/how-to-assess-your-senior-pets-quality-of-life/)
- [Quality of Life at the End of Life for Your Dog — VCA](https://vcahospitals.com/know-your-pet/quality-of-life-at-the-end-of-life-for-your-dog)
- [Validation of the HHHHHMM Scale — PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10044252/)

**Клещ / Лайм:**
- [Lyme Disease in Dogs — The Animal Medical Center (AMC)](https://www.amcny.org/pet_health_library/lyme-disease-in-pets/)
- [Lyme Disease in Dogs — MedVet](https://www.medvet.com/lyme-disease-in-dogs/)
- [Lyme Disease in Dogs — AKC](https://www.akc.org/expert-advice/health/lyme-disease-in-dogs/)
- [Preventing Ticks on Pets — CDC](https://cdc.gov/ticks/prevention/preventing-ticks-on-pets.html)

**Отчёт врачу / дневник симптомов:**
- [Recording Video for Your Veterinarian — Pet Health Network](https://www.pethealthnetwork.com/news-blogs/a-vets-life/recording-video-your-veterinarian)
- [Preparing for Your Pet's Vet Visit — PetSmart Learning Center](https://www.petsmart.com/learning-center/pet-care/preparing-for-your-pets-vet-visit)

**Лекарства — приверженность и UX:**
- [A User-Centered Medication Tracker Application — Medium](https://medium.com/@nehakagada.95/a-user-centered-medication-tracker-application-dd1352316188)
- [How to create a medication adherence app — Cogniss](https://www.cogniss.com/blog/2023/8/22/how-to-create-a-medication-adherence-app)

**Архитектура offline-first / local-first PWA:**
- [Three storage layers in an offline-first health PWA — DEV](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)
- [Offline-first without a backend: a local-first PWA you can trust — DEV](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15)
- [Local-First Architecture for Progressive Web Apps — OpenReplay](https://blog.openreplay.com/local-first-pwa-architecture/)

**Киберхондрия / тревога от симптом-чекеров:**
- [Cyberchondria and complexity — Frontiers in Psychology](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1794803/full)
- [User Experience of Symptom Checkers: A Systematic Review — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10148318/)
- [Only the anxious ones? Characteristics of symptom checker app users — BMC Med Inform Decis Mak](https://link.springer.com/article/10.1186/s12911-024-02430-5)
