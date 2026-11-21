# START HERE

Database хранит инструкции и скиллы для Codex. Если пользователь прислал только ссылку, прочитай эту страницу и задай один вопрос о задаче. Если задача понятна, выбери пакет самостоятельно. Подключай Database к проекту по прямой просьбе пользователя.

## Получить Database и выбрать пакет

Для подключения нужны Node.js 22 или новее и Git. Для первой загрузки выполни команды в новом каталоге.

```text
git clone --filter=blob:none --sparse --branch database https://github.com/Gakulllka/ai-database.git "<каталог Database>"
git -C "<каталог Database>" sparse-checkout add common
cd "<каталог Database>"
node common/tools/database.mjs catalog
```

Выбери пакет из каталога и скачай его папку целиком. Здесь пример для `learning`.

```text
git sparse-checkout add common learning
git rev-parse HEAD
```

Если копия Database уже есть, получи свежий коммит и открой его в отдельной чистой рабочей копии. Так текущая ветка и её изменения остаются на месте.

```text
git fetch origin database
git rev-parse FETCH_HEAD
git worktree add --detach --no-checkout "<новый каталог снимка>" "<найденный коммит>"
git -C "<новый каталог снимка>" sparse-checkout set common learning
git -C "<новый каталог снимка>" checkout --detach "<найденный коммит>"
```

| Пакет | Когда выбрать |
| --- | --- |
| [common](common/README.md) | Общие инструкции Codex и подключение Database |
| [1c](1c/README.md) | Разработка и сопровождение 1С |
| [godot](godot/README.md) | Godot, игровые механики, баланс и плейтесты |
| [development](development/README.md) | Разработка, тестирование и выпуск ПО |
| [design](design/README.md) | Интерфейсы, визуальный дизайн и игровые материалы |
| [learning](learning/README.md) | Поиск источников, практическое обучение и создание скиллов |

Машиночитаемый каталог лежит в [common/catalog.json](common/catalog.json). В `pack.json` каждого пакета указаны его скиллы, ресурсные папки и зависимости. Читай каталог и материалы выбранного пакета из одного коммита.

## Подключить проект

Из корня скачанного снимка укажи абсолютный путь проекта. Для нескольких пакетов повтори `--pack`. По `dependsOn` в `pack.json` скачай также папки с зависимостями из того же коммита.
Если пользователь попросил подключить Database, а цель проекта пока не назвал, выполни `setup` без `--pack`. После установки общего пакета назови несколько доступных направлений и спроси, над чем он хочет работать в первую очередь.

```text
node common/tools/database.mjs setup --project "<абсолютный путь к проекту>" --pack learning
node common/tools/database.mjs check --project "<абсолютный путь к проекту>"
```

`setup` устанавливает `common` и выбранные пакеты, сохраняет ранее подключённые темы и создаёт только недостающие файлы для подключения. Управляемый блок Database появляется в `AGENTS.md` и в `AGENTS.override.md`, если второй файл уже есть. Скиллы хранятся в `.database/library/<pack>/skills/`, а `.agents/skills/` делает их доступными Codex. Выбранные роли размещаются в `.codex/agents/`.

Основной ИИ координирует субагентов и интегрирует их работу. Он выбирает доступную модель и reasoning для каждой подзадачи; поставляемые роли не закрепляют эти параметры. В common есть architect, planner, explorer, docs-researcher, reviewer и database-curator; development добавляет implementation-worker, language-reviewer, e2e-runner, security-reviewer, test-reviewer и build-error-resolver. Для 1С и Godot предусмотрены профильные ревьюеры и диагносты. См. [порядок оркестрации](common/docs/agents/orchestration.md).

Команда `setup` работает только с выбранным проектом. При первом явно запрошенном подключении отдельно запусти согласованную установку глобальных хуков.

```text
node common/hooks/install.js
```

Открой новый сеанс Codex и проверь определения в `/hooks`. Доверие к ним подтверждает пользователь в Codex. При повторном подключении проверь результат через `check` и сохрани по одной регистрации каждого уже настроенного хука.

## Продолжать работу

В подключённом проекте при существенной смене цели возьми свежий снимок, найди подходящую тему и самостоятельно добавь пакет. Если подходящего навыка нет или он не сработал, исследуй способ решения и проверь его на примере. Порядок сохранения таких находок описан в [common](common/README.md). Перед публикацией запусти `node common/tools/database.mjs verify` в полной проверочной копии.

[Лицензия](common/licenses/LICENSE) · [Инструкция для Codex](common/skills/database-onboarding/SKILL.md) · [Шаблон AGENTS.md](common/templates/AGENTS.md)
